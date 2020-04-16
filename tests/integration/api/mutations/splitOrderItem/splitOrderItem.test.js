import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const SplitOrderItemMutation = importAsString("./SplitOrderItemMutation.graphql");

jest.setTimeout(300000);

let testApp;
let splitOrderItem;
let catalogItem;
let mockOrdersAccount;
let shopId;

const fulfillmentMethodId = "METHOD_ID";
const mockShipmentMethod = {
  _id: fulfillmentMethodId,
  handling: 0,
  label: "mockLabel",
  name: "mockName",
  rate: 3.99
};

const mockInvoice = Factory.OrderInvoice.makeOne({
  currencyCode: "USD",
  // Need to ensure 0 discount to avoid creating negative totals
  discounts: 0
});
delete mockInvoice._id; // bug in Factory pkg

beforeAll(async () => {
  const getFulfillmentMethodsWithQuotes = (context, commonOrderExtended, [rates]) => {
    rates.push({
      carrier: "CARRIER",
      handlingPrice: 0,
      method: mockShipmentMethod,
      rate: 3.99,
      shippingPrice: 3.99,
      shopId
    });
  };

  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);

  testApp.registerPlugin({
    name: "splitOrderItem.test.js",
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });

  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:orders/move:item"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);


  mockOrdersAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOrdersAccount);

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  // Disable the flat rates pkg so that only our getFulfillmentMethodsWithQuotes fn is used
  await testApp.collections.AppSettings.updateOne(
    { shopId },
    {
      $set: {
        isShippingRatesFulfillmentEnabled: false
      }
    },
    { upsert: true }
  );

  splitOrderItem = testApp.mutate(SplitOrderItemMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user with `reaction:legacy:orders/move:item` permission can split an order item", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    productId: catalogItem.product.productId,
    quantity: 3,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        invoice: mockInvoice,
        items: [orderItem],
        itemIds: [orderItem._id],
        shipmentMethod: {
          ...mockShipmentMethod,
          currencyCode: "USD"
        },
        shopId,
        totalItemQuantity: 3
      })
    ],
    shopId,
    totalItemQuantity: 3,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await splitOrderItem({
      itemId: encodeOpaqueId("reaction/orderItem", orderItem._id),
      newItemQuantity: 2,
      orderId: encodeOpaqueId("reaction/order", order._id)
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.splitOrderItem.newItemId).toEqual(jasmine.any(String));

  const group = result.splitOrderItem.order.fulfillmentGroups[0];
  const items = group.items.nodes;
  const existingItem = items.find((item) => item._id === encodeOpaqueId("reaction/orderItem", orderItem._id));
  const newItem = items.find((item) => item._id !== encodeOpaqueId("reaction/orderItem", orderItem._id));

  expect(existingItem.quantity).toBe(1);
  expect(newItem.quantity).toBe(2);
  expect(newItem.status).toBe(existingItem.status);
  expect(existingItem.productConfiguration.productVariantId).toBe(newItem.productConfiguration.productVariantId);
});

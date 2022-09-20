import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const MoveOrderItemsMutation = importAsString("./MoveOrderItemsMutation.graphql");

jest.setTimeout(300000);

let testApp;
let moveOrderItems;
let catalogItem;
let shopId;

const fulfillmentMethodId = "METHOD_ID";
const mockShipmentMethod = {
  _id: fulfillmentMethodId,
  handling: 0,
  label: "mockLabel",
  name: "mockName",
  rate: 3.99
};

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
    name: "moveOrderItems.test.js",
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });

  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);

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

  moveOrderItems = testApp.mutate(MoveOrderItemsMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

const accountInternalId = "123";

test("user who placed an order can move an order item", async () => {
  await testApp.setLoggedInUser({ _id: accountInternalId });

  const group1Items = Factory.OrderItem.makeMany(3, {
    price: {
      amount: 4.99,
      currencyCode: "USD"
    },
    productId: catalogItem.product.productId,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group2Items = Factory.OrderItem.makeMany(2, {
    price: {
      amount: 4.99,
      currencyCode: "USD"
    },
    productId: catalogItem.product.productId,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const group1 = Factory.OrderFulfillmentGroup.makeOne({
    invoice: Factory.OrderInvoice.makeOne({
      currencyCode: "USD",
      // Need to ensure 0 discount to avoid creating negative totals
      discounts: 0
    }),
    items: group1Items,
    shipmentMethod: {
      ...mockShipmentMethod,
      currencyCode: "USD"
    },
    shopId
  });

  const group2 = Factory.OrderFulfillmentGroup.makeOne({
    invoice: Factory.OrderInvoice.makeOne({
      currencyCode: "USD",
      // Need to ensure 0 discount to avoid creating negative totals
      discounts: 0
    }),
    items: group2Items,
    shipmentMethod: {
      ...mockShipmentMethod,
      currencyCode: "USD"
    },
    shopId
  });

  const order = Factory.Order.makeOne({
    accountId: accountInternalId,
    shipping: [group1, group2],
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  const group1OpaqueId = encodeOpaqueId("reaction/orderFulfillmentGroup", group1._id);
  const group2OpaqueId = encodeOpaqueId("reaction/orderFulfillmentGroup", group2._id);

  let result;
  try {
    result = await moveOrderItems({
      fromFulfillmentGroupId: group1OpaqueId,
      itemIds: [encodeOpaqueId("reaction/orderItem", group1Items[0]._id), encodeOpaqueId("reaction/orderItem", group1Items[1]._id)],
      orderId: encodeOpaqueId("reaction/order", order._id),
      toFulfillmentGroupId: group2OpaqueId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const updatedGroup1 = result.moveOrderItems.order.fulfillmentGroups.find((group) =>
    group._id === group1OpaqueId);

  const updatedGroup2 = result.moveOrderItems.order.fulfillmentGroups.find((group) =>
    group._id === group2OpaqueId);

  expect(updatedGroup1.items.nodes.length).toBe(1);
  expect(updatedGroup2.items.nodes.length).toBe(4);
});

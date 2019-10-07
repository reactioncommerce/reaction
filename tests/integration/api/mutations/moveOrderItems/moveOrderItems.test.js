import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import {
  encodeOrderFulfillmentGroupOpaqueId,
  encodeOrderItemOpaqueId,
  encodeOrderOpaqueId
} from "@reactioncommerce/reaction-graphql-xforms/order";
import MoveOrderItemsMutation from "./MoveOrderItemsMutation.graphql";

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

  testApp = new TestApp({
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });

  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  moveOrderItems = testApp.mutate(MoveOrderItemsMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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

  const group1OpaqueId = encodeOrderFulfillmentGroupOpaqueId(group1._id);
  const group2OpaqueId = encodeOrderFulfillmentGroupOpaqueId(group2._id);

  let result;
  try {
    result = await moveOrderItems({
      fromFulfillmentGroupId: group1OpaqueId,
      itemIds: [encodeOrderItemOpaqueId(group1Items[0]._id), encodeOrderItemOpaqueId(group1Items[1]._id)],
      orderId: encodeOrderOpaqueId(order._id),
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

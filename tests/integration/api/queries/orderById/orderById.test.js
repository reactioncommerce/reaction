import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "/imports/test-utils/helpers/TestApp";


const orderId = "123"
const internalShopId = "456";
const shopName = "Test Shop";

const order = Factory.Order.makeOne({
  _id: orderId,
  shop: [
    {
      _id: internalShopId,
      name: shopName
    }
  ],  
});

const orderByIdQuery = `query ($id: ID!, $shopId: ID!) {
  orderById(id: $id, shopId: $shopId) {
    _id
    shop {
      name
      shopId
    }
  }
}`;

let testApp;
let query;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  query = query(orderByIdQuery);

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Orders.insertOne(order);


afterAll(() => testApp.stop());

test("get order successful", async () => {
  let result = await query({ id: orderId, shopId: internalShopId });
  expect(result._id).toBe(orderId);
  expect(result.shop.name).toBe(shopName);
  expect(result.shop.shopId).toBe(internalShopId);
}

test("get order error", async () => {
  try {
    let result = await query({ id: orderId, shopId: "" });
  } catch (error) {
    expect(error).toBe(ReactionError);
    return;
  }
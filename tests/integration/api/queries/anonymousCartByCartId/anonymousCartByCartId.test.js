import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AnonymousCartByCartIdQuery = importAsString("./AnonymousCartByCartIdQuery.graphql");

jest.setTimeout(300000);

let anonymousCartByCartId;
let mockCart;
let opaqueCartId;
let shopId;
let testApp;
const cartToken = "TOKEN";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  anonymousCartByCartId = testApp.query(AnonymousCartByCartIdQuery);

  // create mock cart
  mockCart = Factory.Cart.makeOne({
    shopId,
    anonymousAccessToken: hashToken(cartToken),
    shipping: null,
    items: [],
    workflow: null
  });

  opaqueCartId = encodeOpaqueId("reaction/cart", mockCart._id);
  await testApp.collections.Cart.insertOne(mockCart);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Cart.deleteMany({});
  await testApp.stop();
});

test("an anonymous user can retrieve their cart", async () => {
  let result;
  try {
    result = await anonymousCartByCartId({ cartId: opaqueCartId, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.anonymousCartByCartId._id).toEqual(opaqueCartId);
});

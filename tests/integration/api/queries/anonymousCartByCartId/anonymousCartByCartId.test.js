import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Factory from "/tests/util/factory.js";
import { ReactionAPICore } from "@reactioncommerce/api-core";

const AnonymousCartByCartIdQuery = importAsString("./AnonymousCartByCartIdQuery.graphql");

jest.setTimeout(300000);

let anonymousCartByCartId;
let mockCart;
let opaqueCartId;
let shopId;
let testApp;
const cartToken = "TOKEN";

beforeAll(async () => {
  testApp = new ReactionAPICore();
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);
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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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

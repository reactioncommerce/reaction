import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import getCartById from "./getCartById.js";

test("should throw when cart not found and throwIfNotFound is true", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  mockContext.collections.Cart.findOne.mockReturnValueOnce(null);
  const expectedError = new ReactionError("not-found", "Cart not found");
  await expect(getCartById(mockContext, cartId, { cartToken, throwIfNotFound: true })).rejects.toThrow(expectedError);
});

test("should return null when cart not found and throwIfNotFound is false", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  mockContext.collections.Cart.findOne.mockReturnValueOnce(null);
  await expect(getCartById(mockContext, cartId, { cartToken, throwIfNotFound: false })).toMatchObject({});
});

test("should throw when cart found but accountId does not match", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  mockContext.accountId = "accountId123";
  const cart = {
    _id: cartId,
    anonymousAccessToken: cartToken,
    accountId: "accountId456"
  };
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));
  const expectedError = new ReactionError("access-denied", "Access Denied");
  await expect(getCartById(mockContext, cartId, { cartToken, throwIfNotFound: true })).rejects.toThrow(expectedError);
});

test("should return cart when cart found and accountId matches", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  mockContext.accountId = "accountId123";
  const cart = {
    _id: cartId,
    anonymousAccessToken: cartToken,
    accountId: "accountId123"
  };
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));
  const result = await getCartById(mockContext, cartId, { cartToken, throwIfNotFound: true });
  expect(result).toMatchObject(cart);
});

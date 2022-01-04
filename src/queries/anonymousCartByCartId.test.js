import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import anonymousCartByCartId from "./anonymousCartByCartId.js";

test("query anonymous cart", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  const cart = {
    _id: cartId,
    anonymousAccessToken: cartToken
  };
  const callingParams = {
    _id: cartId,
    anonymousAccessToken: hashToken(cartToken)
  };

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));

  const result = await anonymousCartByCartId(mockContext, { cartId, cartToken });
  expect(result).toEqual(cart);
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith(callingParams);
});

test("query without hashed access token", async () => {
  const cartId = "123";
  const cartToken = "xyz";
  const callingParams = {
    _id: cartId,
    anonymousAccessToken: cartToken
  };

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(null));

  const result = await anonymousCartByCartId(mockContext, { cartId, cartToken });
  expect(result).toEqual(null);
  expect(mockContext.collections.Cart.findOne).not.toHaveBeenCalledWith(callingParams);
});

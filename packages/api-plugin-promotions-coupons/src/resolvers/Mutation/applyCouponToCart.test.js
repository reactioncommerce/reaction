import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyCouponToCart from "./applyCouponToCart.js";

test("should call applyCouponToCart mutation", async () => {
  const cart = { _id: "cartId" };

  mockContext.mutations.applyCouponToCart = jest.fn().mockName("applyCouponToCart").mockResolvedValueOnce(cart);
  const input = { shopId: "_shopId", cartId: "_id", couponCode: "CODE", token: "anonymousToken" };

  expect(await applyCouponToCart(null, { input }, mockContext)).toEqual({ cart });
  expect(mockContext.mutations.applyCouponToCart).toHaveBeenCalledWith(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    token: "anonymousToken"
  });
});

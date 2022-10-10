import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyCouponToCart from "./applyCouponToCart.js";

test("should call applyCouponToCart mutation", async () => {
  const cart = {
    _id: "cartId"
  };

  mockContext.mutations.applyCouponToCart = jest.fn().mockName("applyCouponToCart").mockReturnValueOnce(Promise.resolve(cart));
  const input = { cartId: "_id", couponCode: "CODE" };
  
  expect(await applyCouponToCart(null, { input }, mockContext)).toEqual({ cart });
  expect(mockContext.mutations.applyCouponToCart).toHaveBeenCalledWith(mockContext, { cartId: "_id", couponCode: "CODE" });
});

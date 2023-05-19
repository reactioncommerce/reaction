import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeCouponFromCart from "./removeCouponFromCart.js";

test("calls mutations.removeCouponFromCart and returns the result", async () => {
  const input = { cartId: "123", couponCode: "CODE" };
  const result = { _id: "123 " };
  mockContext.mutations = {
    removeCouponFromCart: jest.fn().mockName("mutations.removeCouponFromCart").mockReturnValueOnce(Promise.resolve(result))
  };

  const removedCoupon = await removeCouponFromCart(null, { input }, mockContext);

  expect(removedCoupon).toEqual({ cart: result });
  expect(mockContext.mutations.removeCouponFromCart).toHaveBeenCalledWith(mockContext, input);
});

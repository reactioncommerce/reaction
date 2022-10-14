import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import applyCouponToCart from "./applyCouponToCart.js";

test("should call applyExplicitPromotionToCart mutation", async () => {
  const now = new Date();
  const cart = {
    _id: "cartId"
  };
  const promotion = {
    _id: "promotionId",
    type: "explicit",
    endDate: new Date(now.setMonth(now.getMonth() + 1))
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockReturnValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockReturnValueOnce(promotion)
  };
  mockContext.mutations.applyExplicitPromotionToCart = jest.fn().mockName("applyExplicitPromotionToCart").mockReturnValueOnce(Promise.resolve(cart));

  await applyCouponToCart(mockContext, { cartId: "cartId", couponCode: "CODE" });

  expect(mockContext.mutations.applyExplicitPromotionToCart).toHaveBeenCalledWith(mockContext, cart, promotion);
});

test("should throw error if cart not found", async () => {
  mockContext.collections.Cart = {
    findOne: jest.fn().mockReturnValueOnce(null)
  };
  const expectedError = new ReactionError("not-found", "Cart not found");
  await expect(applyCouponToCart(mockContext, { cartId: "cartId", couponCode: "CODE" })).rejects.toThrow(expectedError);
});

test("should throw error if promotion not found", async () => {
  const cart = { _id: "cartId" };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockReturnValueOnce(undefined)
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockReturnValueOnce(cart)
  };

  const expectedError = new ReactionError("not-found", "The coupon is not available");

  expect(applyCouponToCart(mockContext, { cartId: "cartId", couponCode: "CODE" })).rejects.toThrow(expectedError);
});

test("should throw error if promotion expired", async () => {
  const now = new Date();
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit",
    endDate: new Date(now.setMonth(now.getMonth() - 1))
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockReturnValueOnce(promotion)
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockReturnValueOnce(cart)
  };

  const expectedError = new ReactionError("coupon-expired", "The coupon is expired");

  await expect(applyCouponToCart(mockContext, { cartId: "cartId", couponCode: "CODE" })).rejects.toThrow(expectedError);
});

test("should throw error if promotion already exists on the cart", async () => {
  const now = new Date();
  const cart = {
    _id: "cartId",
    appliedPromotions: [
      {
        _id: "promotionId"
      }
    ]
  };
  const promotion = {
    _id: "promotionId",
    type: "explicit",
    endDate: new Date(now.setMonth(now.getMonth() + 1))
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockReturnValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockReturnValueOnce(promotion)
  };

  const expectedError = new Error("coupon-already-exists", "The coupon already applied on the cart");

  await expect(applyCouponToCart(mockContext, { cartId: "cartId", couponCode: "CODE" })).rejects.toThrow(expectedError);
});

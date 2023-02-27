import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";
import applyCouponToCart from "./applyCouponToCart.js";

beforeEach(() => {
  jest.resetAllMocks();
});

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
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.mutations.applyExplicitPromotionToCart = jest.fn().mockName("applyExplicitPromotionToCart").mockResolvedValueOnce(cart);

  await applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  });

  expect(mockContext.mutations.applyExplicitPromotionToCart).toHaveBeenCalledWith(mockContext, cart, promotion);
});

test("should throw error if cart not found", async () => {
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(null)
  };
  const expectedError = new ReactionError("not-found", "Cart not found");
  await expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error if promotion not found", async () => {
  const cart = { _id: "cartId" };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(undefined)
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };

  const expectedError = new ReactionError("not-found", "The coupon is not available");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
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
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };

  const expectedError = new ReactionError("coupon-expired", "The coupon is expired");

  await expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
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
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };

  const expectedError = new Error("coupon-already-exists", "The coupon already applied on the cart");

  await expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should query cart with anonymous token when the input provided cartToken", () => {
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };

  applyCouponToCart(mockContext, { shopId: "_shopId", cartId: "_id", couponCode: "CODE", cartToken: "anonymousToken" });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "_id", anonymousAccessToken: hashToken("anonymousToken"), shopId: "_shopId" });
});

test("should query cart with accountId when request is authenticated user", async () => {
  const cart = { _id: "cartId" };
  const account = {
    _id: "_accountId",
    userId: "_userId"
  };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Accounts = {
    findOne: jest.fn().mockResolvedValueOnce(account)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };

  mockContext.userId = "_userId";

  await applyCouponToCart(mockContext, { shopId: "_shopId", cartId: "_id", couponCode: "CODE" });

  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ userId: "_userId" });
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "_id", accountId: "_accountId", shopId: "_shopId" });
});

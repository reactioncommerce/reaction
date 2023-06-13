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
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };
  mockContext.mutations.applyExplicitPromotionToCart = jest.fn().mockName("applyExplicitPromotionToCart").mockResolvedValueOnce(cart);

  await applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  });

  const expectedPromotion = {
    ...promotion,
    relatedCoupon: {
      couponId: "couponId",
      couponCode: "CODE"
    }
  };

  expect(mockContext.mutations.applyExplicitPromotionToCart).toHaveBeenCalledWith(mockContext, cart, expectedPromotion);
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
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(undefined)
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };

  const expectedError = new ReactionError("not-found", "The coupon is not available");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error if coupon not found", async () => {
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([])
    })
  };

  const expectedError = new ReactionError("invalid-params", "The coupon CODE is not found");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error when more than one coupon have same code", async () => {
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon, coupon])
    })
  };

  const expectedError = new ReactionError("not-found", "The coupon have duplicate with other promotion. Please contact admin for more information");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error if promotion expired", async () => {
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([])
    })
  };
  const expectedError = new ReactionError("invalid-params", "The coupon CODE is not found");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error when more than one coupon have same code", async () => {
  const cart = { _id: "cartId" };
  const promotion = {
    _id: "promotionId",
    type: "explicit"
  };
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };

  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon, coupon])
    })
  };

  const expectedError = new ReactionError("not-found", "The coupon have duplicate with other promotion. Please contact admin for more information");

  expect(applyCouponToCart(mockContext, {
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
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };
  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };

  const expectedError = new Error("The coupon already applied on the cart");

  await expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw error when coupon is expired", async () => {
  const cart = {
    _id: "cartId"
  };
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId",
    maxUsageTimes: 10,
    usedCount: 10
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };

  const expectedError = new ReactionError("not-found", "The coupon is expired");

  expect(applyCouponToCart(mockContext, {
    shopId: "_shopId",
    cartId: "_id",
    couponCode: "CODE",
    cartToken: "anonymousToken"
  })).rejects.toThrow(expectedError);
});

test("should throw an error when the coupon reaches the maximum usage limit per user", async () => {
  const cart = {
    _id: "cartId"
  };
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId",
    maxUsageTimesPerUser: 1,
    usedCount: 1
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce({ _id: "couponLogId", usedCount: 1 })
  };

  const expectedError = new ReactionError("not-found", "The coupon is expired");

  expect(applyCouponToCart(mockContext, {
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

  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
  };

  mockContext.collections.Cart = {
    findOne: jest.fn().mockResolvedValueOnce(cart)
  };
  mockContext.collections.Promotions = {
    findOne: jest.fn().mockResolvedValueOnce(promotion)
  };
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };

  mockContext.mutations.applyExplicitPromotionToCart = jest.fn().mockName("applyExplicitPromotionToCart").mockResolvedValueOnce(cart);

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
  const coupon = {
    _id: "couponId",
    code: "CODE",
    promotionId: "promotionId"
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
  mockContext.collections.Coupons = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValueOnce([coupon])
    })
  };

  mockContext.userId = "_userId";
  mockContext.mutations.applyExplicitPromotionToCart = jest.fn().mockName("applyExplicitPromotionToCart").mockResolvedValueOnce(cart);

  await applyCouponToCart(mockContext, { shopId: "_shopId", cartId: "_id", couponCode: "CODE" });

  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ userId: "_userId" });
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "_id", accountId: "_accountId", shopId: "_shopId" });
});

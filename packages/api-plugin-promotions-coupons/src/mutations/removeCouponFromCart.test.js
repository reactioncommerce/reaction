import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeCouponFromCart from "./removeCouponFromCart.js";

test("throws if validation check fails", async () => {
  const input = { shopId: "123", cartId: "123" };

  try {
    await removeCouponFromCart(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("throws error when cart does not exist with userId", async () => {
  const input = { shopId: "123", cartId: "123", promotionId: "promotionId" };
  mockContext.collections = {
    Accounts: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    },
    Cart: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    }
  };

  try {
    await removeCouponFromCart(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Cart not found");
  }
});

test("throws error when cart does not exist", async () => {
  const input = { shopId: "123", cartId: "123", promotionId: "promotionId" };
  const account = { _id: "accountId" };
  mockContext.collections = {
    Accounts: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(account))
    },
    Cart: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    }
  };

  try {
    await removeCouponFromCart(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
    expect(error.message).toEqual("Cart not found");
  }
});

test("throws error when promotionId is not found on cart", async () => {
  const input = { shopId: "123", cartId: "123", promotionId: "promotionId" };
  const account = { _id: "accountId" };
  const cart = { appliedPromotions: [{ _id: "promotionId2" }] };
  mockContext.collections = {
    Accounts: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(account))
    },
    Cart: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(cart))
    }
  };

  try {
    await removeCouponFromCart(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
    expect(error.message).toEqual("Can't remove coupon because it's not on the cart");
  }
});

test("removes coupon from cart", async () => {
  const input = { shopId: "123", cartId: "123", promotionId: "promotionId" };
  const account = { _id: "accountId" };
  const cart = { appliedPromotions: [{ _id: "promotionId" }] };
  mockContext.collections = {
    Accounts: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(account))
    },
    Cart: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(cart))
    }
  };
  mockContext.mutations = {
    saveCart: jest.fn().mockName("mutations.saveCart").mockReturnValueOnce(Promise.resolve({}))
  };

  const result = await removeCouponFromCart(mockContext, input);
  expect(result).toEqual({});
});

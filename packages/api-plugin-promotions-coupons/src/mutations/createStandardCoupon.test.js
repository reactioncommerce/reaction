import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createStandardCoupon from "./createStandardCoupon.js";

test("throws if validation check fails", async () => {
  const input = { code: "CODE" };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("throws error when coupon code already created", async () => {
  const input = { code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const coupon = { _id: "123", code: "CODE", promotionId: "promotionId" };
  const promotion = { _id: "promotionId" };
  mockContext.collections = {
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion)),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([promotion]))
      })
    },
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(coupon)),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([coupon]))
      }),
      insertOne: jest.fn().mockResolvedValueOnce(Promise.resolve({ insertedId: "123", insertedCount: 1 }))
    }
  };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Coupon code already created");
  }
});

test("throws error when promotion does not exist", async () => {
  const input = { code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  mockContext.collections = {
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    }
  };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Promotion not found");
  }
});

test("throws error when coupon code already exists in promotion window", async () => {
  const now = new Date();
  const input = { code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", startDate: now, endDate: now };
  const existsPromotion = { _id: "1234", startDate: now, endDate: now };
  const coupon = { _id: "123", code: "CODE", promotionId: "123" };
  mockContext.collections = {
    Coupons: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([coupon]))
      })
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion)),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([existsPromotion]))
      })
    }
  };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("A coupon code CODE already exists in this promotion window");
  }
});

test("should insert a new coupon and results created results", async () => {
  const now = new Date();
  const input = { code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", endDate: now };

  mockContext.collections = {
    Coupons: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      }),
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null)),
      insertOne: jest.fn().mockResolvedValueOnce(Promise.resolve({ insertedId: "123", insertedCount: 1 }))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion))
    }
  };

  const result = await createStandardCoupon(mockContext, input);

  expect(result).toEqual({
    success: true,
    coupon: {
      _id: "123",
      canUseInStore: true,
      code: "CODE",
      createdAt: jasmine.any(Date),
      expirationDate: now,
      maxUsageTimes: 0,
      maxUsageTimesPerUser: 0,
      promotionId: "123",
      shopId: "123",
      updatedAt: jasmine.any(Date),
      usedCount: 0
    }
  });
});

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
  const input = { name: "test", code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const coupon = { _id: "123", code: "CODE", promotionId: "promotionId" };
  const promotion = { _id: "promotionId", triggerType: "explicit" };
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
      // eslint-disable-next-line id-length
      insertOne: jest.fn().mockResolvedValueOnce(Promise.resolve({ insertedId: "123", result: { n: 1 } }))
    }
  };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Coupon code already created");
  }
});

test("throws error when promotion does not exist", async () => {
  const input = { name: "test", code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
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

test("throws error when promotion is not explicit", async () => {
  const input = { name: "test", code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", triggerType: "automatic" };
  mockContext.collections = {
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion))
    }
  };

  try {
    await createStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Coupon can only be created for explicit promotions");
  }
});

test("throws error when coupon code already exists in promotion window", async () => {
  const now = new Date();
  const input = { name: "test", code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", startDate: now, endDate: now, triggerType: "explicit" };
  const existsPromotion = { _id: "1234", startDate: now, endDate: now, triggerType: "explicit" };
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
    // eslint-disable-next-line max-len
    expect(error.message).toEqual("A promotion with this coupon code is already set to be active during part of this promotion window. Please either adjust your coupon code or your Promotion Start and End Dates");
  }
});

test("should insert a new coupon and return the created results", async () => {
  const now = new Date();
  const input = { name: "test", code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", endDate: now, triggerType: "explicit" };

  mockContext.collections = {
    Coupons: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      }),
      // eslint-disable-next-line id-length
      insertOne: jest.fn().mockResolvedValueOnce(Promise.resolve({ insertedId: "123", result: { n: 1 } }))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion))
    }
  };

  const result = await createStandardCoupon(mockContext, input);

  expect(mockContext.collections.Coupons.insertOne).toHaveBeenCalledTimes(1);
  expect(mockContext.collections.Coupons.find).toHaveBeenCalledTimes(1);

  expect(result).toEqual({
    success: true,
    coupon: {
      _id: "123",
      canUseInStore: true,
      name: "test",
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

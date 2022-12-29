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

test("should insert a new coupon and return the created results", async () => {
  const now = new Date();
  const input = { code: "CODE", shopId: "123", promotionId: "123", canUseInStore: true };
  const promotion = { _id: "123", endDate: now };

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

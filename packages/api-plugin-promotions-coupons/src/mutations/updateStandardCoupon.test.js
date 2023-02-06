import _ from "lodash";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateStandardCoupon from "./updateStandardCoupon.js";

const now = new Date();
const mockCoupon = {
  _id: "123",
  code: "CODE",
  promotionId: "123",
  shopId: "123",
  canUseInStore: false,
  usedCount: 0,
  createdAt: now,
  updatedAt: now,
  maxUsageTimes: 10,
  maxUsageTimesPerUser: 1
};

test("throws if validation check fails", async () => {
  const input = { code: "CODE" };

  try {
    await updateStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.error).toEqual("validation-error");
  }
});

test("throws error when coupon does not exist", async () => {
  const input = { code: "CODE", _id: "123", shopId: "123", canUseInStore: true };
  mockContext.collections = {
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    }
  };
  try {
    await updateStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Coupon not found");
  }
});

test("throws error when promotion does not exist", async () => {
  const input = { code: "CODE", shopId: "123", _id: "123" };
  const coupon = _.cloneDeep(mockCoupon);
  mockContext.collections = {
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(coupon))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(null))
    }
  };

  try {
    await updateStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Promotion not found");
  }
});

test("throws error when the related promotion is in promotion window", async () => {
  const input = { code: "CODE", shopId: "123", _id: "123" };
  const promotion = { _id: "123", startDate: now, endDate: now };
  const coupon = _.cloneDeep(mockCoupon);
  mockContext.collections = {
    Coupons: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(coupon))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion))
    }
  };

  try {
    await updateStandardCoupon(mockContext, input);
  } catch (error) {
    expect(error.message).toEqual("Cannot update a coupon for a promotion that has already started");
  }
});

test("throws error when coupon code already exists in promotion window", async () => {
  const input = { code: "NEW_CODE", shopId: "123", _id: "123" };
  const promotion = {
    _id: "123",
    startDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 1),
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)
  };
  const existsPromotion = {
    _id: "1234",
    startDate: now,
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10)
  };
  const coupon = _.cloneDeep(mockCoupon);
  mockContext.collections = {
    Coupons: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([coupon]))
      }),
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(coupon))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion)),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(Promise.resolve([existsPromotion]))
      })
    }
  };

  try {
    await updateStandardCoupon(mockContext, input);
  } catch (error) {
    // eslint-disable-next-line max-len
    expect(error.message).toEqual("A promotion with this coupon code is already set to be active during part of this promotion window. Please either adjust your coupon code or your Promotion Start and End Dates");
  }
});

test("should update coupon and return the updated results", async () => {
  const input = { name: "test", code: "CODE", shopId: "123", _id: "123", canUseInStore: true };
  const promotion = { _id: "123", endDate: now };
  const coupon = _.cloneDeep(mockCoupon);
  mockContext.collections = {
    Coupons: {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      }),
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(coupon)),
      findOneAndUpdate: jest.fn().mockResolvedValueOnce(Promise.resolve({ modifiedCount: 1, value: { _id: "123" } }))
    },
    Promotions: {
      findOne: jest.fn().mockResolvedValueOnce(Promise.resolve(promotion))
    }
  };

  const result = await updateStandardCoupon(mockContext, input);

  expect(mockContext.collections.Coupons.findOneAndUpdate).toHaveBeenCalledTimes(1);
  expect(mockContext.collections.Coupons.findOne).toHaveBeenCalledTimes(1);

  expect(result).toEqual({
    success: true,
    coupon: {
      _id: "123"
    }
  });
});

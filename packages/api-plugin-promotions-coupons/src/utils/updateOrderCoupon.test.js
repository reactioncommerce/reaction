import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateOrderCoupon from "./updateOrderCoupon.js";

test("shouldn't do anything if there are no related coupons", async () => {
  const order = {
    appliedPromotions: [
      {
        _id: "promotionId",
        type: "explicit",
        endDate: new Date()
      }
    ]
  };
  mockContext.collections.Coupons = {
    findOne: jest.fn().mockResolvedValueOnce(null)
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce(null)
  };

  await updateOrderCoupon(mockContext, order);

  expect(mockContext.collections.Coupons.findOne).not.toHaveBeenCalled();
  expect(mockContext.collections.CouponLogs.findOne).not.toHaveBeenCalled();
});

test("shouldn't do anything if there are no coupon found ", async () => {
  const order = {
    appliedPromotions: [
      {
        _id: "promotionId",
        type: "explicit",
        endDate: new Date(),
        relatedCoupon: {
          couponId: "couponId",
          couponCode: "CODE"
        }
      }
    ]
  };
  mockContext.collections.Coupons = {
    findOne: jest.fn().mockResolvedValueOnce(null)
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce(null)
  };

  await updateOrderCoupon(mockContext, order);

  expect(mockContext.collections.Coupons.findOne).toHaveBeenCalled();
  expect(mockContext.collections.CouponLogs.findOne).not.toHaveBeenCalled();
});

test("should throw error if coupon has been used the maximum number of times", async () => {
  const order = {
    appliedPromotions: [
      {
        _id: "promotionId",
        type: "explicit",
        endDate: new Date(),
        relatedCoupon: {
          couponId: "couponId",
          couponCode: "CODE"
        }
      }
    ]
  };
  mockContext.collections.Coupons = {
    findOne: jest.fn().mockResolvedValueOnce({
      _id: "couponId",
      maxUsageTimes: 1
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      value: {
        usedCount: 2
      }
    })
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce(null),
    insertOne: jest.fn().mockResolvedValueOnce({})
  };

  await expect(updateOrderCoupon(mockContext, order)).rejects.toThrow("Coupon no longer available.");
  expect(mockContext.collections.Coupons.findOneAndUpdate).toHaveBeenNthCalledWith(2, { _id: "couponId" }, { $inc: { usedCount: -1 } });
});

test("should throw error if coupon has been used the maximum number of times per user", async () => {
  const order = {
    appliedPromotions: [
      {
        _id: "promotionId",
        type: "explicit",
        endDate: new Date(),
        relatedCoupon: {
          couponId: "couponId",
          couponCode: "CODE"
        }
      }
    ]
  };
  mockContext.collections.Coupons = {
    findOne: jest.fn().mockResolvedValueOnce({
      _id: "couponId",
      maxUsageTimesPerUser: 1
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      value: {
        usedCount: 1
      }
    })
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce({
      usedCount: 1
    }),
    insertOne: jest.fn().mockResolvedValueOnce({}),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      value: {
        usedCount: 1
      }
    })
  };

  await expect(updateOrderCoupon(mockContext, order)).rejects.toThrow("Your coupon has been used the maximum number of times.");
  expect(mockContext.collections.Coupons.findOneAndUpdate).toHaveBeenNthCalledWith(2, { _id: "couponId" }, { $inc: { usedCount: -1 } });
});

test("should create new coupon log if there is no coupon log found", async () => {
  const order = {
    appliedPromotions: [
      {
        _id: "promotionId",
        type: "explicit",
        endDate: new Date(),
        relatedCoupon: {
          couponId: "couponId",
          couponCode: "CODE"
        }
      }
    ]
  };
  mockContext.collections.Coupons = {
    findOne: jest.fn().mockResolvedValueOnce({
      _id: "couponId",
      maxUsageTimesPerUser: 1
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      value: {
        usedCount: 1
      }
    })
  };
  mockContext.collections.CouponLogs = {
    findOne: jest.fn().mockResolvedValueOnce(null),
    insertOne: jest.fn().mockResolvedValueOnce({})
  };

  await updateOrderCoupon(mockContext, order);

  expect(mockContext.collections.CouponLogs.insertOne).toHaveBeenCalled();
});

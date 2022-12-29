import SimpleSchema from "simpl-schema";

export const CouponTriggerParameters = new SimpleSchema({
  name: String,
  couponCode: {
    type: String
  }
});

export const Coupon = new SimpleSchema({
  _id: String,
  code: String,
  shopId: String,
  promotionId: String,
  userId: {
    type: String,
    optional: true
  },
  canUseInStore: {
    type: Boolean,
    defaultValue: false
  },
  expirationDate: {
    type: Date,
    optional: true
  },
  maxUsageTimesPerUser: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  maxUsageTimes: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  usedCount: {
    type: Number,
    defaultValue: 0
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
});

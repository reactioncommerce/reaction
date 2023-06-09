import SimpleSchema from "simpl-schema";

export const CouponTriggerCondition = new SimpleSchema({
  conditions: {
    type: Object
  }
});

export const CouponTriggerParameters = new SimpleSchema({
  conditions: {
    type: Object
  },
  inclusionRules: {
    type: CouponTriggerCondition,
    optional: true
  },
  exclusionRules: {
    type: CouponTriggerCondition,
    optional: true
  }
});

export const Coupon = new SimpleSchema({
  _id: String,
  name: String,
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
  isArchived: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  discountId: {
    type: String,
    optional: true
  }
});

export const CouponLog = new SimpleSchema({
  "_id": String,
  "shopId": String,
  "couponId": String,
  "promotionId": String,
  "orderId": {
    type: String,
    optional: true
  },
  "accountId": {
    type: String,
    optional: true
  },
  "usedCount": {
    type: Number,
    defaultValue: 0
  },
  "createdAt": {
    type: Date
  },
  "usedLogs": {
    type: Array,
    optional: true
  },
  "usedLogs.$": {
    type: Object,
    blackbox: true
  }
});

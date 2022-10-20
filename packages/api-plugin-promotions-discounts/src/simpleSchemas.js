import SimpleSchema from "simpl-schema";

const Conditions = new SimpleSchema({
  maxUses: {
    // total number of uses
    type: Number,
    defaultValue: 1
  },
  maxUsesPerAccount: {
    // Max uses per account
    type: SimpleSchema.Integer,
    defaultValue: 1,
    optional: true
  },
  maxUsersPerOrder: {
    // Max uses per order
    type: Number,
    defaultValue: 1
  }
});

const Event = new SimpleSchema({
  type: String,
  params: {
    type: Object,
    optional: true
  }
});

export const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  },
  event: {
    type: Event
  }
});

/**
 * @name Discounts
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Discounts schema
 */
export const Discount = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    label: "Discounts shopId"
  },
  label: {
    type: String
  },
  description: {
    type: String
  },
  discountType: {
    type: String,
    allowedValues: ["item", "order", "shipping"]
  },
  discountCalculationType: {
    type: String,
    allowedValues: ["flat", "fixed", "percentage"] // this can be extended via plugin
  },
  discountValue: {
    type: Number
  },
  inclusionRules: {
    type: Rules
  },
  exclusionRules: {
    type: Rules,
    optional: true
  },
  conditions: {
    type: Conditions,
    optional: true
  }
});

export const CartDiscount = new SimpleSchema({
  actionKey: String,
  promotionId: String,
  rules: {
    // because shipping discounts are evaluated later, they need to have inclusion rules on them
    type: Rules,
    optional: true
  },
  discountCalculationType: String, // types provided by this plugin are flat, percentage and fixed
  discountValue: Number,
  dateApplied: {
    type: Date
  },
  dateExpires: {
    type: Date,
    optional: true
  }
});

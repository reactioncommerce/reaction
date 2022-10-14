import SimpleSchema from "simpl-schema";

export const CouponTriggerParameters = new SimpleSchema({
  name: String,
  couponCode: {
    type: String
  }
});

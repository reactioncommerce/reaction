import SimpleSchema from "simpl-schema";

export const OfferTriggerParameters = new SimpleSchema({
  name: String,
  conditions: {
    type: Object,
    blackbox: true
  }
});

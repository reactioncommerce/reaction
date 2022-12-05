import SimpleSchema from "simpl-schema";

const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  }
});

export const OfferTriggerParameters = new SimpleSchema({
  name: String,
  conditions: {
    type: Object,
    blackbox: true
  },
  inclusionRules: {
    type: Rules,
    optional: true
  },
  exclusionRules: {
    type: Rules,
    optional: true
  }
});

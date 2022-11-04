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
  inclusionRule: {
    type: Rules,
    optional: true
  },
  exclusionRule: {
    type: Rules,
    optional: true
  }
});

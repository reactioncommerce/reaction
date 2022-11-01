import SimpleSchema from "simpl-schema";

const OfferTriggerFact = new SimpleSchema({
  name: String,
  handlerName: String,
  fromFact: {
    type: String,
    optional: true
  }
});

const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  }
});

export const OfferTriggerParameters = new SimpleSchema({
  "name": String,
  "conditions": {
    type: Object,
    blackbox: true
  },
  "facts": {
    type: Array,
    optional: true
  },
  "facts.$": {
    type: OfferTriggerFact
  },
  "inclusionRule": {
    type: Rules,
    optional: true
  },
  "exclusionRule": {
    type: Rules,
    optional: true
  }
});

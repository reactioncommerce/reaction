import SimpleSchema from "simpl-schema";

const allowOperators = [
  "equal",
  "notEqual",
  "lessThan",
  "lessThanInclusive",
  "greaterThan",
  "greaterThanInclusive",
  "in",
  "notIn",
  "contains",
  "doesNotContain"
];

export const ConditionRule = new SimpleSchema({
  "fact": {
    type: String,
    allowedValues: ["cart", "item"]
  },
  "operator": {
    type: String,
    allowedValues: allowOperators
  },
  "path": {
    type: String,
    optional: true
  },
  "value": {
    type: SimpleSchema.oneOf(String, Number, Boolean, Array)
  },
  "value.$": {
    type: SimpleSchema.oneOf(String, Number, Boolean)
  },
  "params": {
    type: Object,
    blackbox: true,
    optional: true
  }
});

export const RuleExpression = new SimpleSchema({
  "all": {
    type: Array,
    optional: true
  },
  "all.$": {
    type: ConditionRule
  },
  "any": {
    type: Array,
    optional: true
  },
  "any.$": {
    type: ConditionRule
  }
});

export const OfferTriggerCondition = new SimpleSchema({
  conditions: {
    type: RuleExpression
  }
});

export const OfferTriggerParameters = new SimpleSchema({
  name: String,
  conditions: {
    type: RuleExpression
  },
  inclusionRules: {
    type: OfferTriggerCondition,
    optional: true
  },
  exclusionRules: {
    type: OfferTriggerCondition,
    optional: true
  }
});

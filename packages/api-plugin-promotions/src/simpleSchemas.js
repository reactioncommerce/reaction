import SimpleSchema from "simpl-schema";

const RulesEvent = new SimpleSchema({
  type: {
    type: String,
  },
  params: {
    type: Object,
    blackbox: true,
  },
});

export const JSONRulesEngineRule = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true,
  },
  event: {
    type: RulesEvent,
  },
});

export const Action = new SimpleSchema({
  actionKey: {
    type: String,
    allowedValues: ["noop"],
  },
  actionParameters: {
    type: Object,
    blackbox: true,
  },
});

export const Trigger = new SimpleSchema({
  triggerKey: {
    type: String,
    allowedValues: ["offers"],
  },
  triggerParameters: {
    type: Object,
    blackbox: true,
    optional: true,
  },
});

/**
 * @name Promotion
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Promotions schema
 */
export const Promotion = new SimpleSchema({
  _id: {
    type: String,
  },
  shopId: {
    type: String,
  },
  label: {
    type: String,
  },
  description: {
    type: String,
  },
  enabled: {
    type: Boolean,
    defaultValue: false,
  },
  triggers: {
    type: Array,
  },
  "triggers.$": {
    type: Trigger,
  },
  actions: {
    type: Array,
  },
  "actions.$": {
    type: Action,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    // leaving this empty means it never ends
    type: Date,
    optional: true,
  },
  exclusionFilters: {
    type: Array,
    optional: true,
  },
  "exclusionFilters.$": {
    type: JSONRulesEngineRule,
  },
  stackAbility: {
    // defines what other offers it can be defined as
    type: String,
    allowedValues: ["none", "per-type", "all"],
  },
  reportAsTaxable: {
    // should we report the discounted amount
    type: Boolean,
    defaultValue: true,
  },
});

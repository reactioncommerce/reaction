import SimpleSchema from "simpl-schema";

export const Action = new SimpleSchema({
  actionKey: {
    type: String,
    allowedValues: ["noop"]
  },
  actionParameters: {
    type: Object,
    blackbox: true
  }
});

export const Trigger = new SimpleSchema({
  triggerKey: {
    type: String,
    allowedValues: []
  },
  triggerParameters: {
    type: Object,
    blackbox: true
  }
});

/**
 * @name Promotion
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Promotions schema
 */
export const Promotion = new SimpleSchema({
  "_id": {
    type: String
  },
  "type": {
    type: String,
    allowedValues: ["implicit", "explicit"]
  },
  "shopId": {
    type: String
  },
  "label": {
    type: String
  },
  "description": {
    type: String
  },
  "enabled": {
    type: Boolean,
    defaultValue: false
  },
  "triggers": {
    type: Array
  },
  "triggers.$": {
    type: Trigger
  },
  "actions": {
    type: Array
  },
  "actions.$": {
    type: Action
  },
  "startDate": {
    type: Date
  },
  "endDate": {
    // leaving this empty means it never ends
    type: Date,
    optional: true
  },
  "stackAbility": {
    // defines what other offers it can be defined as
    type: String,
    allowedValues: ["none", "per-type", "all"]
  }
});

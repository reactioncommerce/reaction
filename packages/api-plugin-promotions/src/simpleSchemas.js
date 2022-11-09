import SimpleSchema from "simpl-schema";
import promotionTypes from "./promotionTypes/index.js";

const promotionTypeKeys = promotionTypes.map((pt) => pt.name);

export const Action = new SimpleSchema({
  actionKey: {
    type: String,
    allowedValues: ["noop", "discount"]
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

export const PromotionType = new SimpleSchema({
  name: {
    type: String
  },
  action: {
    type: Action,
    optional: true
  },
  trigger: {
    type: Trigger,
    optional: true
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
  "triggerType": {
    type: String,
    allowedValues: ["implicit", "explicit"]
  },
  "promotionType": {
    type: String, // this is the key to the promotion type object
    allowedValues: promotionTypeKeys
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
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date
  }
});

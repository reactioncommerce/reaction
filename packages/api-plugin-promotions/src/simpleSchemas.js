import SimpleSchema from "simpl-schema";
import promotionTypes from "./promotionTypes/index.js";

const promotionTypeKeys = promotionTypes.map((pt) => pt.name);

export const Action = new SimpleSchema({
  actionKey: {
    type: String,
    allowedValues: ["noop", "discounts"]
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

export const Stackability = new SimpleSchema({
  key: {
    type: String,
    allowedValues: []
  },
  parameters: {
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
  "triggerType": {
    type: String,
    allowedValues: ["implicit", "explicit"]
  },
  "promotionType": {
    type: String, // this is the key to the promotion type object
    allowedValues: promotionTypeKeys
  },
  "referenceId": {
    type: SimpleSchema.Integer
  },
  "shopId": {
    type: String
  },
  "label": {
    type: String
  },
  "name": {
    type: String
  },
  "description": {
    type: String,
    optional: true
  },
  "enabled": {
    type: Boolean,
    defaultValue: false
  },
  "state": {
    type: String,
    allowedValues: ["created", "active", "completed", "archived"],
    defaultValue: "created"
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
  "stackability": {
    type: Stackability
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date
  },
  "callToActionMessage": {
    type: String,
    optional: true
  },
  "termsAndConditionsUrl": {
    type: String,
    optional: true
  }
});

export const CartPromotionItem = new SimpleSchema({
  _id: String,
  name: String,
  label: String,
  description: {
    type: String,
    optional: true
  },
  triggerType: {
    type: String,
    allowedValues: ["implicit", "explicit"]
  },
  isTemporary: {
    type: Boolean,
    defaultValue: false
  }
});

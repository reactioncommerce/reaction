import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, shopIdAutoValue, updatedAtAutoValue } from "./helpers";
import { Document, Notes } from "./orders";
import { Metafield } from "./metafield";
import { Workflow } from "./workflow";

/**
 * @name Inventory
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id optional, inserted by Mongo, we need it for schema validation
 * @property {String} shopId required, Inventory shopId
 * @property {String} productId required
 * @property {String} variantId required
 * @property {String} orderItemId optional
 * @property {Workflow} workflow optional
 * @property {String} sku optional
 * @property {Metafield[]} metafields optional
 * @property {Document[]} documents optional
 * @property {Notes[]} notes optional
 * @property {Date} createdAt optional, but consider it temporary: schema validation failing in method with required
 * @property {Date} updatedAt optional
 */
export const Inventory = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Inventory ShopId"
  },
  "productId": {
    type: String,
    index: true
  },
  "variantId": {
    type: String,
    index: true
  },
  "orderItemId": {
    type: String,
    index: true,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "sku": {
    label: "sku",
    type: String,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": {
    type: Document
  },
  "notes": {
    type: Array,
    optional: true
  },
  "notes.$": {
    type: Notes
  },
  "createdAt": {
    type: Date,
    optional: true,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Inventory", Inventory);

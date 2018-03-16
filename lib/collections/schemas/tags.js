import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, shopIdAutoValue } from "./helpers";
import { Metafield } from "./metafield";

/**
 * @name Tag
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id optional
 * @property {String} name required
 * @property {String} slug required
 * @property {String} type optional
 * @property {Metafield[]} metafields optional
 * @property {Number} position optional
 * @property {String[]} relatedTagIds optional
 * @property {Boolean} isDeleted default value: `false`
 * @property {Boolean} isTopLevel required
 * @property {Boolean} isVisible defalut value: `true`
 * @property {String[]} groups optional, default value: `[],` groupIds that this tag belongs to
 * @property {String} shopId Tag shopId
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const Tag = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "name": {
    type: String,
    index: 1
  },
  "slug": String,
  "type": {
    type: String,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": Metafield,
  "position": {
    type: SimpleSchema.Integer,
    optional: true
  },
  "relatedTagIds": {
    type: Array,
    optional: true,
    index: 1
  },
  "relatedTagIds.$": String,
  "isDeleted": {
    type: Boolean,
    defaultValue: false
  },
  "isTopLevel": Boolean,
  "isVisible": {
    type: Boolean,
    defaultValue: true
  },
  "groups": {
    type: Array, // groupIds that this tag belongs to
    optional: true,
    defaultValue: []
  },
  "groups.$": String,
  "shopId": {
    type: String,
    index: 1,
    autoValue: shopIdAutoValue,
    label: "Tag shopId"
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    autoValue() {
      return new Date();
    }
  }
}, { check, tracker: Tracker });

registerSchema("Tag", Tag);

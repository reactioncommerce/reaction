import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue } from "./helpers";
import { Metafield } from "./metafield";

/**
 * @name Tag
 * @memberof Schemas
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
 * @property {Boolean} isVisible default value: `true`
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
  "name": String,
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
    optional: true
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
  },
  "heroMediaUrl": {
    type: String,
    optional: true
  },
  "displayTitle": {
    type: String,
    optional: true
  },
  "featuredProductIds": {
    type: Array,
    optional: true
  },
  "featuredProductIds.$": String
});

registerSchema("Tag", Tag);

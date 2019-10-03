import SimpleSchema from "simpl-schema";

/**
 * @name Metafield
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} key optional
 * @property {String} namespace optional
 * @property {String} scope optional
 * @property {String} value optional
 * @property {String} valueType optional
 * @property {String} description optional
 */
const Metafield = new SimpleSchema({
  key: {
    type: String,
    max: 30,
    optional: true
  },
  namespace: {
    type: String,
    max: 20,
    optional: true
  },
  scope: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  valueType: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

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
    type: Date
  },
  "updatedAt": {
    type: Date
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

import SimpleSchema from "simpl-schema";

/**
 * @name createdAtAutoValue
 * @memberof Schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: createdAtAutoValue
 * @returns {Date} Date representing now if it's an insert
 */
export function createdAtAutoValue() {
  // We don't want to unset or overwrite a createdAt in a nested
  // document, for example, in a product being added to cart items
  if (this.closestSubschemaFieldName) return;

  /* eslint-disable consistent-return */
  // This function returns different `types`, therefore
  // consistent-return needs to be disabled
  if (this.isInsert) return new Date();
  if (this.isUpsert) return { $setOnInsert: new Date() };
  return this.unset();
  /* eslint-enable consistent-return */
}

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

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
 * @name ShippingParcel
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} containers optional
 * @property {Number} length optional
 * @property {Number} width optional
 * @property {Number} height optional
 * @property {Number} weight optional
 */
const ShippingParcel = new SimpleSchema({
  containers: {
    type: String,
    optional: true
  },
  length: {
    type: Number,
    optional: true
  },
  width: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  },
  weight: {
    type: Number,
    optional: true
  }
});

/**
 * @name Workflow
 * @summary Control view flow by attaching layout to a collection.
 * Shop defaultWorkflow is defined in Shop.
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status, default value: `new`
 * @property {String[]} workflow optional
 */
const Workflow = new SimpleSchema({
  "status": {
    type: String
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
});

/**
 * @name VariantMedia
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} mediaId optional
 * @property {Number} priority optional
 * @property {Metafield[]} metafields optional
 * @property {Date} updatedAt optional
 * @property {Date} createdAt required
 */
export const VariantMedia = new SimpleSchema({
  "mediaId": {
    type: String,
    optional: true
  },
  "priority": {
    type: SimpleSchema.Integer,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "createdAt": {
    type: Date
  }
});

/**
 * @name ProductVariant
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required, Variant ID
 * @property {String[]} ancestors, default value: `[]`
 * @property {String} barcode optional
 * @property {Date} createdAt optional
 * @property {Number} height optional, default value: `0`
 * @property {Number} index optional, Variant position number in list. Keep array index for moving variants in a list.
 * @property {Boolean} isDeleted, default value: `false`
 * @property {Boolean} isVisible, default value: `false`
 * @property {Number} length optional, default value: `0`
 * @property {Metafield[]} metafields optional
 * @property {Number} minOrderQuantity optional
 * @property {String} optionTitle, Option internal name, default value: `"Untitled option"`
 * @property {String} originCountry optional
 * @property {String} shopId required, Variant ShopId
 * @property {String} sku optional
 * @property {String} title, Label for customers, default value: `""`
 * @property {String} type, default value: `"variant"`
 * @property {Date} updatedAt optional
 * @property {Number} weight, default value: `0`
 * @property {Number} width optional, default value: `0`
 * @property {Workflow} workflow optional
 */
export const ProductVariant = new SimpleSchema({
  "_id": {
    type: String,
    label: "Variant ID"
  },
  "ancestors": {
    type: Array
  },
  "ancestors.$": {
    type: String
  },
  "attributeLabel": {
    type: String,
    optional: true
  },
  "barcode": {
    type: String,
    optional: true
  },
  "createdAt": {
    type: Date,
    optional: true
  },
  "height": {
    type: Number,
    min: 0,
    optional: true
  },
  "index": {
    label: "Variant position number in list",
    type: SimpleSchema.Integer,
    optional: true
  },
  "isDeleted": {
    type: Boolean
  },
  "isVisible": {
    type: Boolean
  },
  "length": {
    type: Number,
    min: 0,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "minOrderQuantity": {
    label: "Minimum order quantity",
    type: SimpleSchema.Integer,
    optional: true
  },
  "optionTitle": {
    type: String,
    optional: true
  },
  "originCountry": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String
  },
  "sku": {
    type: String,
    optional: true
  },
  "title": {
    type: String,
    optional: true
  },
  "type": {
    type: String
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "weight": {
    type: Number,
    min: 0,
    optional: true
  },
  "width": {
    type: Number,
    min: 0,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true
  }
});

/**
 * @name Product
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id Product ID
 * @property {String[]} ancestors default value: `[]`
 * @property {Date} createdAt required
 * @property {String} currentProductHash optional
 * @property {String} description optional
 * @property {String} facebookMsg optional
 * @property {String} googleplusMsg optional
 * @property {String} handle slug
 * @property {String[]} hashtags optional
 * @property {Boolean} isDeleted, default value: `false`
 * @property {Boolean} isVisible, default value: `false`
 * @property {String} metaDescription optional
 * @property {Metafield[]} metafields optional
 * @property {String} originCountry optional
 * @property {String} pageTitle optional
 * @property {ShippingParcel} parcel optional
 * @property {String} pinterestMsg optional
 * @property {String} productType optional
 * @property {Date} publishedAt optional
 * @property {String} publishedProductHash optional
 * @property {String} shopId Product ShopID
 * @property {Boolean} shouldAppearInSitemap optional, whether this product should appear in auto-generated sitemap.xml
 * @property {String[]} supportedFulfillmentTypes Types of fulfillment ("shipping", "pickup", etc) allowed for this product
 * @property {String} template optional
 * @property {String} title Product Title
 * @property {String} twitterMsg optional
 * @property {String} type default value: `"simple"`
 * @property {Date} updatedAt optional
 * @property {String} vendor optional
 * @property {Workflow} workflow optional
 */
export const Product = new SimpleSchema({
  "_id": {
    type: String,
    label: "Product ID"
  },
  "ancestors": {
    type: Array
  },
  "ancestors.$": {
    type: String
  },
  "createdAt": {
    type: Date
  },
  "currentProductHash": {
    type: String,
    optional: true
  },
  "description": {
    type: String,
    optional: true
  },
  "facebookMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "googleplusMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "handle": {
    type: String
  },
  "hashtags": {
    type: Array,
    optional: true
  },
  "hashtags.$": {
    type: String
  },
  "isDeleted": {
    type: Boolean
  },
  "isVisible": {
    type: Boolean
  },
  "metaDescription": {
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
  "originCountry": {
    type: String,
    optional: true
  },
  "pageTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "pinterestMsg": {
    type: String,
    optional: true,
    max: 255
  },
  "productType": {
    type: String,
    optional: true
  },
  "publishedAt": {
    type: Date,
    optional: true
  },
  "publishedProductHash": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String
  },
  "shouldAppearInSitemap": {
    type: Boolean,
    optional: true
  },
  "supportedFulfillmentTypes": {
    type: Array
  },
  "supportedFulfillmentTypes.$": String,
  "template": {
    type: String,
    optional: true
  },
  "title": {
    type: String
  },
  "twitterMsg": {
    type: String,
    optional: true,
    max: 140
  },
  "type": {
    type: String
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "vendor": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true
  }
});

// Deprecated. This schema is no longer used but because it's registered
// for extension by other plugins, we're keeping it here to avoid breaking
// other plugins. This can be deleted when there's a major release.
export const ProductVariantInputSchema = new SimpleSchema({});

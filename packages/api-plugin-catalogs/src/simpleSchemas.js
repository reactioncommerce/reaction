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
export const ShippingParcel = new SimpleSchema({
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
 * @name ImageSizes
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} large optional
 * @property {String} medium optional
 * @property {String} original optional
 * @property {String} small optional
 * @property {String} thumbnail optional
 */
export const ImageSizes = new SimpleSchema({
  large: {
    type: String,
    label: "Large",
    optional: true
  },
  medium: {
    type: String,
    label: "Medium",
    optional: true
  },
  original: {
    type: String,
    label: "Original",
    optional: true
  },
  small: {
    type: String,
    label: "Small",
    optional: true
  },
  thumbnail: {
    type: String,
    label: "Thumbnail",
    optional: true
  }
});

/**
 * @name ImageInfo
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Number} priority required
 * @property {String} productId required
 * @property {String} variantId optional
 * @property {ImageSizes} URLs required
 */
export const ImageInfo = new SimpleSchema({
  priority: {
    type: Number,
    defaultValue: 0
  },
  productId: {
    type: String,
    label: "Product Id"
  },
  variantId: {
    type: String,
    label: "Variant Id",
    optional: true
  },
  URLs: {
    type: ImageSizes
  }
});

/**
 * @name SocialMetadata
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} message required
 * @property {String} service required
 */
export const SocialMetadata = new SimpleSchema({
  message: {
    type: String,
    label: "Message",
    optional: true
  },
  service: {
    type: String,
    label: "Service",
    optional: true
  }
});

/**
 * @name CatalogProductOption
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} attributeLabel required
 * @property {String} barcode optional
 * @property {Date} createdAt required
 * @property {Number} height optional, default value: `0`
 * @property {Number} index required
 * @property {Number} length optional, default value: `0`
 * @property {ImageInfo[]} media optional
 * @property {Metafield[]} metafields optional
 * @property {Number} minOrderQuantity optional, default value: `1`
 * @property {String} optionTitle optional
 * @property {String} originCountry optional
 * @property {ImageInfo} primaryImage optional
 * @property {String} shopId required
 * @property {String} sku optional
 * @property {String} title optional
 * @property {Date} updatedAt required
 * @property {String} variantId required
 * @property {Number} weight optional, default value: `0`
 * @property {Number} width optional, default value: `0`
 */
export const CatalogProductOption = new SimpleSchema({
  "_id": {
    type: String,
    label: "Catalog product variant Id"
  },
  "attributeLabel": String,
  "barcode": {
    type: String,
    label: "Barcode",
    optional: true
  },
  "createdAt": {
    type: Date,
    label: "Date/time this variant was created at"
  },
  "height": {
    type: Number,
    label: "Height",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "index": {
    type: SimpleSchema.Integer,
    label: "The position of this variant among other variants at the same level of the product-variant-option hierarchy"
  },
  "length": {
    type: Number,
    label: "Length",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "media": {
    type: Array,
    label: "Media",
    optional: true
  },
  "media.$": {
    type: ImageInfo
  },
  "metafields": {
    type: Array,
    label: "Metafields",
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "minOrderQuantity": {
    type: SimpleSchema.Integer,
    label: "Minimum quantity per item in an order",
    defaultValue: 1,
    optional: true
  },
  "optionTitle": {
    type: String,
    label: "Option title",
    optional: true
  },
  "originCountry": {
    type: String,
    label: "Origin country",
    optional: true
  },
  "primaryImage": {
    type: ImageInfo,
    label: "Primary Image",
    optional: true
  },
  "shopId": {
    type: String,
    label: "Product ShopId"
  },
  "sku": {
    type: String,
    label: "SKU",
    optional: true
  },
  "title": {
    type: String,
    label: "Product Title",
    defaultValue: "",
    optional: true
  },
  "updatedAt": {
    type: Date,
    label: "Updated at"
  },
  "variantId": {
    type: String,
    label: "Variant ID"
  },
  "weight": {
    type: Number,
    label: "Weight",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "width": {
    type: Number,
    label: "Width",
    min: 0,
    optional: true,
    defaultValue: 0
  }
});

/**
 * @name CatalogProductVariant
 * @memberof Schemas
 * @type {SimpleSchema}
 * @extends CatalogProductOption
 * @property {CatalogProductOption[]} options optional
 */
export const CatalogProductVariant = CatalogProductOption.clone().extend({
  "options": {
    type: Array,
    label: "Variant Options",
    optional: true
  },
  "options.$": {
    type: CatalogProductOption
  }
});

/**
 * @name CatalogProduct
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} barcode optional
 * @property {Date} createdAt required
 * @property {String} description optional
 * @property {Number} height optional, default value: `0`
 * @property {Boolean} isVisible required, default value: `false`
 * @property {Number} length optional, default value: `0`
 * @property {ImageInfo[]} media optional
 * @property {Metafield[]} metafields optional
 * @property {String} metaDescription optional
 * @property {Number} minOrderQuantity required, default value: `1`
 * @property {String} originCountry optional
 * @property {String} pageTitle optional
 * @property {ShippingParcel} parcel optional
 * @property {ImageInfo} primaryImage optional
 * @property {String} productId required
 * @property {String} productType optional
 * @property {String} shopId required
 * @property {String} sku optional
 * @property {String} slug optional
 * @property {SocialMetadata[]} socialMetadata optional
 * @property {String[]} supportedFulfillmentTypes Types of fulfillment ("shipping", "pickup", etc) allowed for this product
 * @property {Array} tagIds optional
 * @property {String} title optional
 * @property {String} type required, default value: `product-simple`
 * @property {Date} updatedAt required
 * @property {CatalogProductVariant[]} variants optional
 * @property {String} vendor optional
 * @property {Number} weight optional, default value: `0`
 * @property {Number} width optional, default value: `0`
 */
export const CatalogProduct = new SimpleSchema({
  "_id": {
    type: String,
    label: "Product Id"
  },
  "barcode": {
    type: String,
    label: "Barcode",
    optional: true
  },
  "createdAt": {
    type: Date,
    label: "Date/time this product was created at"
  },
  "description": {
    type: String,
    label: "Product description",
    optional: true
  },
  "height": {
    type: Number,
    label: "Height",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "isDeleted": {
    type: Boolean,
    label: "Is deleted",
    defaultValue: false
  },
  "isVisible": {
    type: Boolean,
    label: "Indicates if a product is visible to shoppers",
    defaultValue: false
  },
  "length": {
    type: Number,
    label: "Length",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "media": {
    type: Array,
    label: "Media",
    optional: true
  },
  "media.$": {
    type: ImageInfo
  },
  "metafields": {
    type: Array,
    label: "Metafields",
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "metaDescription": {
    type: String,
    label: "Meta description",
    optional: true
  },
  "minOrderQuantity": {
    type: Number,
    label: "Minimum quantity per item in an order",
    defaultValue: 1,
    optional: true
  },
  "originCountry": {
    type: String,
    label: "Origin country",
    optional: true
  },
  "pageTitle": {
    type: String,
    label: "Page title",
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    label: "Shipping parcel",
    optional: true
  },
  "primaryImage": {
    type: ImageInfo,
    label: "Primary Image",
    optional: true
  },
  "productId": {
    type: String,
    label: "Product Id"
  },
  "productType": {
    type: String,
    label: "Product type",
    optional: true
  },
  "shopId": {
    type: String,
    label: "Product ShopId"
  },
  "sku": {
    type: String,
    label: "SKU",
    optional: true
  },
  "slug": {
    type: String,
    optional: true
  },
  "socialMetadata": {
    type: Array,
    label: "Social Metadata",
    optional: true
  },
  "socialMetadata.$": {
    type: SocialMetadata
  },
  "supportedFulfillmentTypes": {
    type: Array,
    label: "Supported fulfillment types",
    defaultValue: ["shipping"]
  },
  "supportedFulfillmentTypes.$": String,
  "tagIds": {
    type: Array,
    label: "Hashtags",
    optional: true
  },
  "tagIds.$": {
    type: String
  },
  "title": {
    type: String,
    label: "Product Title",
    defaultValue: "",
    optional: true
  },
  "type": {
    type: String,
    label: "Product type",
    defaultValue: "product-simple"
  },
  "updatedAt": {
    type: Date,
    label: "Updated at"
  },
  "variants": {
    type: Array,
    label: "Product Variants",
    optional: true
  },
  "variants.$": {
    type: CatalogProductVariant
  },
  "vendor": {
    type: String,
    label: "Vendor",
    optional: true
  },
  "weight": {
    type: Number,
    label: "Weight",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "width": {
    type: Number,
    label: "Width",
    min: 0,
    optional: true,
    defaultValue: 0
  }
});

/**
 * @name Catalog
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {Object} product required optional
 * @property {Date} createdAt required
 * @property {String} shopId required
 * @property {Date} updatedAt required
 */
export const Catalog = new SimpleSchema({
  _id: {
    type: String,
    label: "Catalog item ID"
  },
  product: {
    type: CatalogProduct,
    optional: true
  },
  createdAt: {
    type: Date,
    label: "Date/time this catalog item was created at"
  },
  shopId: {
    type: String,
    label: "Product ShopId"
  },
  updatedAt: {
    type: Date,
    label: "Updated at"
  }
});

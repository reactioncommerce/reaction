import SimpleSchema from "simpl-schema";
import { Metafield } from "./metafield";
import { ShippingParcel } from "./shipping";

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
 * @property {Number} toGrid required
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
  toGrid: {
    type: Number,
    defaultValue: 0
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
 * @name CatalogPriceRange
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Number} max required
 * @property {Number} min required
 * @property {String} range required
 */
export const CatalogPriceRange = new SimpleSchema({
  max: {
    type: Number,
    label: "Max price"
  },
  min: {
    type: Number,
    label: "Min price"
  },
  range: {
    type: String,
    label: "Price range"
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
 * @name VariantBaseSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} barcode optional
 * @property {Boolean} canBackorder required, Indicates when the seller has allowed the sale of product which is not in stock
 * @property {Date} createdAt required
 * @property {Number} height optional, default value: `0`
 * @property {Number} index required
 * @property {Boolean} inventoryAvailableToSell required, The quantity of this item currently available to sell. This number does not include reserved inventory (i.e. inventory that has been ordered, but not yet processed by the operator). If this is a variant, this number is created by summing all child option inventory numbers. This is most likely the quantity to display in the storefront UI.
 * @property {Boolean} inventoryInStock required, The quantity of this item currently in stock. This number is updated when an order is processed by the operator. This number includes all inventory, including reserved inventory (i.e. inventory that has been ordered, but not yet processed by the operator). If this is a variant, this number is created by summing all child option inventory numbers. This is most likely just used as a reference in the operator UI, and not displayed in the storefront UI. Called `inventoryQuantity` in the Product Schema, and `inventoryInStock` in the Catalog schema.
 * @property {Boolean} inventoryManagement required, True if inventory management is enabled for this variant
 * @property {Boolean} inventoryPolicy required, True if inventory policy is enabled for this variant
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 * @property {Number} length optional, default value: `0`
 * @property {Number} lowInventoryWarningThreshold optional, default value: `0`
 * @property {ImageInfo[]} media optional
 * @property {Metafield[]} metafields optional
 * @property {Number} minOrderQuantity optional, default value: `1`
 * @property {String} optionTitle optional
 * @property {String} originCountry optional
 * @property {CatalogPriceRange} price required
 * @property {Object} pricing required
 * @property {ImageInfo} primaryImage optional
 * @property {String} shopId required
 * @property {String} sku optional
 * @property {String} title optional
 * @property {Date} updatedAt required
 * @property {String} variantId required
 * @property {Number} weight optional, default value: `0`
 * @property {Number} width optional, default value: `0`
 */
export const VariantBaseSchema = new SimpleSchema({
  "_id": {
    type: String,
    label: "Catalog product variant Id"
  },
  "barcode": {
    type: String,
    label: "Barcode",
    optional: true
  },
  "canBackorder": {
    type: Boolean,
    label: "Can backorder"
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
  "inventoryAvailableToSell": {
    type: SimpleSchema.Integer,
    label: "Inventory available to sell"
  },
  "inventoryInStock": {
    type: SimpleSchema.Integer,
    label: "Inventory in stock"
  },
  "inventoryManagement": {
    type: Boolean,
    label: "Inventory management"
  },
  "inventoryPolicy": {
    type: Boolean,
    label: "Inventory policy"
  },
  "isBackorder": {
    type: Boolean,
    label: "Is backordered",
    defaultValue: false
  },
  "isLowQuantity": {
    type: Boolean,
    label: "Is low quantity"
  },
  "isSoldOut": {
    type: Boolean,
    label: "Is sold out"
  },
  "length": {
    type: Number,
    label: "Length",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "lowInventoryWarningThreshold": {
    type: SimpleSchema.Integer,
    label: "Warn at",
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
  "price": {
    type: Number
  },
  "pricing": {
    type: Object,
    blackbox: true,
    label: "Pricing"
  },
  "primaryImage": {
    type: ImageInfo,
    label: "Primary Image",
    optional: true
  },
  "shopId": {
    type: String,
    label: "Product ShopId",
    index: 1
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
 * @name VariantBaseSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @extends VariantBaseSchema
 * @property {VariantBaseSchema[]} options optional
 */
export const CatalogVariantSchema = VariantBaseSchema.clone().extend({
  "options": {
    type: Array,
    label: "Variant Options",
    optional: true
  },
  "options.$": {
    type: VariantBaseSchema
  }
});

/**
 * @name CatalogProduct
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} barcode optional
 * @property {Boolean} canBackorder required
 * @property {Date} createdAt required
 * @property {String} description optional
 * @property {Number} height optional, default value: `0`
 * @property {Boolean} inventoryAvailableToSell required, The quantity of this item currently available to sell. This number does not include reserved inventory (i.e. inventory that has been ordered, but not yet processed by the operator). If this is a variant, this number is created by summing all child option inventory numbers. This is most likely the quantity to display in the storefront UI.
 * @property {Boolean} inventoryInStock required, The quantity of this item currently in stock. This number is updated when an order is processed by the operator. This number includes all inventory, including reserved inventory (i.e. inventory that has been ordered, but not yet processed by the operator). If this is a variant, this number is created by summing all child option inventory numbers. This is most likely just used as a reference in the operator UI, and not displayed in the storefront UI. Called `inventoryQuantity` in the Product Schema, and `inventoryInStock` in the Catalog schema.
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 * @property {Boolean} isVisible required, default value: `false`
 * @property {Number} length optional, default value: `0`
 * @property {Number} lowInventoryWarningThreshold optional, default value: `0`
 * @property {ImageInfo[]} media optional
 * @property {Metafield[]} metafields optional
 * @property {String} metaDescription optional
 * @property {Number} minOrderQuantity required, default value: `1`
 * @property {String} originCountry optional
 * @property {String} pageTitle optional
 * @property {ShippingParcel} parcel optional
 * @property {CatalogPriceRange} price optional
 * @property {Object} pricing required
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
  "canBackorder": {
    type: Boolean,
    label: "Indicates when the seller has allowed the sale of product which is not in stock"
  },
  "createdAt": {
    type: Date,
    label: "Date/time this product was created at",
    index: 1
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
  "inventoryAvailableToSell": {
    type: SimpleSchema.Integer,
    label: "Inventory available to sell"
  },
  "inventoryInStock": {
    type: SimpleSchema.Integer,
    label: "Inventory in stock"
  },
  "isBackorder": {
    type: Boolean,
    label: "Is backorder"
  },
  "isDeleted": {
    type: Boolean,
    label: "Is deleted",
    index: 1,
    defaultValue: false
  },
  "isLowQuantity": {
    type: Boolean,
    label: "Is low quantity"
  },
  "isSoldOut": {
    type: Boolean,
    label: "Is sold out"
  },
  "isVisible": {
    type: Boolean,
    label: "Indicates if a product is visible to non-admin users",
    index: 1,
    defaultValue: false
  },
  "length": {
    type: Number,
    label: "Length",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "lowInventoryWarningThreshold": {
    type: SimpleSchema.Integer,
    label: "Warn at",
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
  "price": {
    type: CatalogPriceRange,
    optional: true
  },
  "pricing": {
    type: Object,
    blackbox: true,
    label: "Pricing"
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
    label: "Product ShopId",
    index: 1
  },
  "sku": {
    type: String,
    label: "SKU",
    optional: true
  },
  "slug": {
    type: String,
    optional: true,
    index: 1
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
    type: CatalogVariantSchema
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
    label: "Date/time this catalog item was created at",
    index: 1
  },
  shopId: {
    type: String,
    label: "Product ShopId",
    index: 1
  },
  updatedAt: {
    type: Date,
    label: "Updated at"
  }
});

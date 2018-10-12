import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";
import { Event } from "./event";
import { Metafield } from "./metafield";
import { ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";

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
    type: Date,
    autoValue: createdAtAutoValue
  }
});

registerSchema("VariantMedia", VariantMedia);

/**
 * @name ProductVariant
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required, Variant ID
 * @property {String[]} ancestors, default value: `[]`
 * @property {Number} index optional, Variant position number in list. Keep array index for moving variants in a list.
 * @property {Boolean} isVisible, default value: `false`
 * @property {Boolean} isDeleted, default value: `false`
 * @property {String} barcode optional
 * @property {Number} compareAtPrice optional, Compare at price
 * @property {String} fulfillmentService optional, Fulfillment service
 * @property {Number} weight, default value: `0`
 * @property {Number} length optional, default value: `0`
 * @property {Number} width optional, default value: `0`
 * @property {Number} height optional, default value: `0`
 * @property {Boolean} inventoryManagement, default value: `true`
 * @property {Boolean} inventoryPolicy, default value: `false`, If disabled, item can be sold even if it not in stock.
 * @property {Number} lowInventoryWarningThreshold, default value: `0`, Warn of low inventory at this number
 * @property {Number} inventoryQuantity, default value: `0`
 * @property {Number} minOrderQuantity optional
 * @property {Boolean} isLowQuantity optional, true when at least 1 variant is below `lowInventoryWarningThreshold`
 * @property {Boolean} isSoldOut optional, denormalized field, indicates when all variants `inventoryQuantity` is 0
 * @property {Number} price, default value: `0.00`
 * @property {String} shopId required, Variant ShopId
 * @property {String} sku optional
 * @property {String} type, default value: `"variant"`
 * @property {Boolean} taxable, default value: `true`
 * @property {String} taxCode, default value: `"0000"`
 * @property {String} taxDescription optional
 * @property {String} title, Label for customers, default value: `""`
 * @property {String} optionTitle, Option internal name, default value: `"Untitled option"`
 * @property {Metafield[]} metafields optional
 * @property {Date} createdAt optional
 * @property {Date} updatedAt optional
 * @property {Event[]} eventLog optional, Variant Event Log
 * @property {Workflow} workflow optional
 * @property {String} originCountry optional
 */
export const ProductVariant = new SimpleSchema({
  "_id": {
    type: String,
    label: "Variant ID"
  },
  "ancestors": {
    type: Array,
    defaultValue: []
  },
  "ancestors.$": {
    type: String
  },
  "index": {
    label: "Variant position number in list",
    type: SimpleSchema.Integer,
    optional: true
  },
  "isVisible": {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  "isDeleted": {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  "barcode": {
    label: "Barcode",
    type: String,
    optional: true,
    custom() {
      if (Meteor.isClient) {
        if (this.siblingField("type").value === "inventory" && !this.value) {
          return SimpleSchema.ErrorTypes.REQUIRED;
        }
      }
    }
  },
  "compareAtPrice": {
    label: "Compare At Price",
    type: Number,
    optional: true,
    min: 0,
    defaultValue: 0.00
  },
  "weight": {
    label: "Weight",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0,
    custom() {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === 0)) {
          return SimpleSchema.ErrorTypes.REQUIRED;
        }
      }
    }
  },
  "length": {
    label: "Length",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "width": {
    label: "Width",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "height": {
    label: "Height",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "inventoryManagement": {
    type: Boolean,
    label: "Inventory Tracking",
    optional: true,
    defaultValue: true,
    custom() {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === false)) {
          return SimpleSchema.ErrorTypes.REQUIRED;
        }
      }
    }
  },
  "inventoryPolicy": {
    type: Boolean,
    label: "Deny when out of stock",
    optional: true,
    defaultValue: false,
    custom() {
      if (Meteor.isClient) {
        if (!(this.siblingField("type").value === "inventory" || this.value ||
          this.value === false)) {
          return SimpleSchema.ErrorTypes.REQUIRED;
        }
      }
    }
  },
  "lowInventoryWarningThreshold": {
    type: SimpleSchema.Integer,
    label: "Warn at",
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "inventoryQuantity": {
    type: SimpleSchema.Integer,
    label: "Quantity",
    optional: true,
    defaultValue: 0
  },
  "minOrderQuantity": {
    label: "Minimum order quantity",
    type: SimpleSchema.Integer,
    optional: true
  },
  "isLowQuantity": {
    label: "Indicates that the product quantity is too low",
    type: Boolean,
    optional: true
  },
  "isSoldOut": {
    label: "Indicates when the product quantity is zero",
    type: Boolean,
    optional: true
  },
  "price": {
    label: "Price",
    type: Number,
    defaultValue: 0.00,
    min: 0,
    optional: true
  },
  "shopId": {
    type: String,
    index: 1,
    label: "Variant ShopId"
  },
  "sku": {
    label: "SKU",
    type: String,
    optional: true
  },
  "type": {
    label: "Type",
    type: String,
    defaultValue: "variant"
  },
  "taxable": {
    label: "Taxable",
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  "taxCode": {
    label: "Tax Code",
    type: String,
    defaultValue: "0000",
    optional: true
  },
  "taxDescription": {
    type: String,
    optional: true,
    label: "Tax Description"
  },
  "title": {
    label: "Label",
    type: String,
    defaultValue: ""
  },
  "optionTitle": {
    label: "Option",
    type: String,
    optional: true,
    defaultValue: "Untitled Option"
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "createdAt": {
    label: "Created at",
    type: Date,
    optional: true
  },
  "updatedAt": {
    label: "Updated at",
    type: Date,
    optional: true
  },
  // TODO: REVIEW - Does this need to exist? Should we use workflow instead?
  // Should it be called 'history' or something else instead?
  // Should this go into the Logger instead? Is the logger robust enough for this?
  "eventLog": {
    label: "Variant Event Log",
    type: Array,
    optional: true
  },
  "eventLog.$": {
    type: Event
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "originCountry": {
    type: String,
    optional: true
  }
});

registerSchema("ProductVariant", ProductVariant);

/**
 * @name PriceRange
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} range, default value: `"0.00"`
 * @property {Number} min optional, default value: `0`
 * @property {Number} max optional, default value: `0`
 */
export const PriceRange = new SimpleSchema({
  range: {
    type: String,
    defaultValue: "0.00"
  },
  min: {
    type: Number,
    defaultValue: 0,
    optional: true
  },
  max: {
    type: Number,
    defaultValue: 0,
    optional: true
  }
});

registerSchema("PriceRange", PriceRange);

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
 * @property {String} handle optional, slug
 * @property {String[]} hashtags optional
 * @property {Boolean} isBackorder denormalized, `true` if product not in stock, but customers anyway could order it
 * @property {Boolean} isDeleted, default value: `false`
 * @property {Boolean} isLowQuantity denormalized, true when at least 1 variant is below `lowInventoryWarningThreshold`
 * @property {Boolean} isSoldOut denormalized, Indicates when all variants `inventoryQuantity` is zero
 * @property {Boolean} isVisible, default value: `false`
 * @property {String} metaDescription optional
 * @property {Metafield[]} metafields optional
 * @property {String} originCountry optional
 * @property {String} pageTitle optional
 * @property {ShippingParcel} parcel optional
 * @property {String} pinterestMsg optional
 * @property {PriceRange} price denormalized, object with range string, min and max
 * @property {String} productType optional
 * @property {Date} publishedAt optional
 * @property {String} publishedProductHash optional
 * @property {String} publishedScope optional
 * @property {String} shopId Product ShopID
 * @property {String[]} supportedFulfillmentTypes Types of fulfillment ("shipping", "pickup", etc) allowed for this product
 * @property {String} template, default value: `"productDetailSimple"`
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
    type: Array,
    defaultValue: [],
    index: 1
  },
  "ancestors.$": {
    type: String
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue,
    index: 1
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
    type: String,
    optional: true,
    index: 1
  },
  "hashtags": {
    type: Array,
    optional: true,
    index: 1
  },
  "hashtags.$": {
    type: String
  },
  "isBackorder": {
    label: "Indicates when the seller has allowed the sale of product which" +
    " is not in stock",
    type: Boolean,
    optional: true
  },
  "isDeleted": {
    type: Boolean,
    index: 1,
    defaultValue: false
  },
  "isLowQuantity": {
    label: "Indicates that the product quantity is too low",
    type: Boolean,
    optional: true
  },
  "isSoldOut": {
    label: "Indicates when the product quantity is zero",
    type: Boolean,
    optional: true
  },
  "isVisible": {
    type: Boolean,
    index: 1,
    defaultValue: false
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
  "price": {
    label: "Price",
    type: PriceRange
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
  "publishedScope": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    index: 1,
    label: "Product ShopId"
  },
  "supportedFulfillmentTypes": {
    type: Array,
    label: "Supported fulfillment types",
    defaultValue: ["shipping"]
  },
  "supportedFulfillmentTypes.$": String,
  "template": {
    label: "Template",
    type: String,
    defaultValue: "productDetailSimple"
  },
  "title": {
    type: String,
    defaultValue: "",
    label: "Product Title"
  },
  "twitterMsg": {
    type: String,
    optional: true,
    max: 140
  },
  "type": {
    label: "Type",
    type: String,
    defaultValue: "simple"
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  },
  "vendor": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

registerSchema("Product", Product);

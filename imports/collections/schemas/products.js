/* eslint-disable consistent-return */
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";
import { Event } from "./event";
import { Metafield } from "./metafield";
import { ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";
import { AttributesSchema as AttributesVariantSchema } from "../extend/productVariant";
import { AttributesSchema as AttributesSimpleSchema } from "../extend/productSimple";

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
 * @property {String} barcode optional
 * @property {Date} createdAt optional
 * @property {Event[]} eventLog optional, Variant Event Log
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
    type: Array,
    defaultValue: []
  },
  "ancestors.$": {
    type: String
  },
  "attributeLabel": {
    type: String,
    optional: true
  },
  "barcode": {
    label: "Barcode",
    type: String,
    optional: true
  },
  "createdAt": {
    label: "Created at",
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
  "height": {
    label: "Height",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "index": {
    label: "Variant position number in list",
    type: SimpleSchema.Integer,
    optional: true
  },
  "isDeleted": {
    type: Boolean,
    defaultValue: false
  },
  "isVisible": {
    type: Boolean,
    defaultValue: false
  },
  "length": {
    label: "Length",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "attributes": {
    type: AttributesVariantSchema,
    optional: true
  },
  "minOrderQuantity": {
    label: "Minimum order quantity",
    type: SimpleSchema.Integer,
    optional: true
  },
  "optionTitle": {
    label: "Option",
    type: String,
    optional: true
  },
  "originCountry": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    label: "Variant ShopId"
  },
  "sku": {
    label: "SKU",
    type: String,
    optional: true
  },
  "title": {
    label: "Label",
    type: String,
    optional: true
  },
  "type": {
    label: "Type",
    type: String,
    defaultValue: "variant"
  },
  "updatedAt": {
    label: "Updated at",
    type: Date,
    optional: true
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
  "width": {
    label: "Width",
    type: Number,
    min: 0,
    optional: true,
    defaultValue: 0
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

registerSchema("ProductVariant", ProductVariant);

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
    type: Array,
    defaultValue: []
  },
  "ancestors.$": {
    type: String
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue
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
    optional: true
  },
  "hashtags": {
    type: Array,
    optional: true
  },
  "hashtags.$": {
    type: String
  },
  "isDeleted": {
    type: Boolean,
    defaultValue: false
  },
  "isVisible": {
    type: Boolean,
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
  "attributes": {
    type: AttributesSimpleSchema,
    optional: true
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
    type: String,
    label: "Product ShopId"
  },
  "shouldAppearInSitemap": {
    type: Boolean,
    optional: true,
    defaultValue: true
  },
  "supportedFulfillmentTypes": {
    type: Array,
    label: "Supported fulfillment types",
    defaultValue: ["shipping"]
  },
  "supportedFulfillmentTypes.$": String,
  "template": {
    label: "Template",
    optional: true,
    type: String
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

import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { getSlug } from "/lib/api";
import { Email } from "./accounts";
import { Address } from "./address";
import { Layout } from "./layouts";
import { Metafield } from "./metafield";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name CustomEmailSettings
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} service optional
 * @property {String} username optional
 * @property {String} password optional
 * @property {String} host optional
 * @property {Number} port optional
 */
export const CustomEmailSettings = new SimpleSchema({
  service: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    optional: true
  },
  password: {
    type: String,
    optional: true
  },
  host: {
    type: String,
    optional: true
  },
  port: {
    type: Number,
    optional: true
  }
});

registerSchema("CustomEmailSettings", CustomEmailSettings);

/**
 * @name Currency
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} symbol default value: $
 * @property {String} format default value: %s%v
 * @property {Number} scale optional, default value: 2
 * @property {String} decimal optional, default value: .
 * @property {String} thousand optional, default value: ,
 * @property {Number} rate optional
 */
export const Currency = new SimpleSchema({
  symbol: {
    type: String,
    defaultValue: "$"
  },
  format: {
    type: String,
    defaultValue: "%s%v"
  },
  scale: {
    type: Number,
    defaultValue: 2,
    optional: true
  },
  decimal: {
    type: String,
    defaultValue: ".",
    optional: true
  },
  thousand: {
    type: String,
    defaultValue: ",",
    optional: true
  },
  rate: {
    type: Number,
    optional: true
  }
});

registerSchema("Currency", Currency);

/**
 * @name Locale
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {Object} continents blackbox
 * @property {Object} countries blackbox
 */
export const Locale = new SimpleSchema({
  continents: {
    type: Object,
    blackbox: true
  },
  countries: {
    type: Object,
    blackbox: true
  }
});

registerSchema("Locale", Locale);

/**
 * @name Languages
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} i18n required
 * @property {Boolean} enabled, default value: true
 */
export const Languages = new SimpleSchema({
  label: {
    type: String
  },
  i18n: {
    type: String
  },
  enabled: {
    type: Boolean,
    defaultValue: true
  }
});

registerSchema("Languages", Languages);

/**
 * @name ShopTheme
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} themeId required
 * @property {String} styles optional
 */
export const ShopTheme = new SimpleSchema({
  themeId: {
    type: String
  },
  styles: {
    type: String,
    optional: true
  }
});

registerSchema("ShopTheme", ShopTheme);

/**
 * @name BrandAsset
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} mediaId optional
 * @property {String} type optional
 */
export const BrandAsset = new SimpleSchema({
  mediaId: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    optional: true
  }
});

registerSchema("BrandAsset", BrandAsset);

/**
 * @name MerchantShop
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} _id Shop label
 * @property {String} slug Shop slug
 * @property {String} name Shop name
 */
const MerchantShop = new SimpleSchema({
  _id: {
    type: String,
    label: "Shop Label"
  },
  slug: {
    type: String,
    label: "Shop Slug"
  },
  name: {
    type: String,
    label: "Shop Name"
  }
});

registerSchema("MerchantShop", MerchantShop);

/**
 * @name Shop
 * @namespace schemas
 * @type {SimpleSchema}
 * @property {String} _id optional
 * @property {String} slug optional
 */
export const Shop = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "slug": {
    type: String,
    optional: true,
    autoValue: function () {
      let slug = getSlug(this.value);

      if (!slug && this.siblingField("name").value) {
        slug = getSlug(this.siblingField("name").value);
      }
      if (this.isInsert) {
        return slug;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: slug
        };
      }
    }
  },
  "merchantShops": {
    type: [MerchantShop],
    optional: true
  },
  "shopType": {
    type: String,
    // Default value is merchant because we seed the first created shop with "primary"
    // In a marketplace, there should only be one "primary" shop
    defaultValue: "merchant", // "primary", "merchant", "affiliate",
    index: true
  },
  "active": {
    type: Boolean,
    defaultValue: true,
    index: true
  },
  // not sure what this is used for. Prefer the boolean above for indexing
  "status": {
    type: String,
    defaultValue: "active"
  },
  "name": {
    type: String,
    index: 1
  },
  "description": {
    type: String,
    optional: true
  },
  "keywords": {
    type: String,
    optional: true
  },
  "addressBook": {
    type: [Address],
    optional: true
  },
  "domains": {
    type: [String],
    defaultValue: ["localhost"],
    index: 1
  },
  "emails": {
    type: [Email],
    optional: true
  },
  "defaultPaymentMethod": {
    label: "Default Payment Method",
    type: String,
    defaultValue: "none"
  },
  "currency": {
    label: "Base Currency",
    type: String,
    defaultValue: "USD"
  },
  "currencies": {
    type: Object, // Schemas.Currency
    blackbox: true,
    optional: true
  },
  "locales": {
    type: Locale
  },
  "language": {
    label: "Base Language",
    type: String,
    defaultValue: "en"
  },
  "languages": {
    type: [Languages],
    optional: true
  },
  "public": {
    type: String,
    optional: true
  },
  "timezone": {
    label: "Timezone",
    type: String,
    defaultValue: "US/Pacific"
  },
  "baseUOL": {
    type: String,
    optional: true,
    defaultValue: "in",
    label: "Base Unit of Length"
  },
  "unitsOfLength": {
    type: [Object],
    optional: true
  },
  "unitsOfLength.$.uol": {
    type: String,
    optional: true,
    defaultValue: "in"
  },
  "unitsOfLength.$.label": {
    type: String,
    optional: true,
    defaultValue: "Inches"
  },
  "unitsOfLength.$.default": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "baseUOM": {
    type: String,
    optional: true,
    defaultValue: "oz",
    label: "Base Unit of Measure"
  },
  "unitsOfMeasure": {
    type: [Object],
    optional: true
  },
  "unitsOfMeasure.$.uom": {
    type: String,
    optional: true,
    defaultValue: "oz"
  },
  "unitsOfMeasure.$.label": {
    type: String,
    optional: true,
    defaultValue: "Ounces"
  },
  "unitsOfMeasure.$.default": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "metafields": {
    type: [Metafield],
    optional: true
  },
  "defaultSellerRoles": {
    type: [String],
    defaultValue: [
      "owner",
      "admin",
      "seller",
      "guest",
      "manage-users",
      "orders",
      "account/profile",
      "product",
      "createProduct",
      "tag",
      "index",
      "cart/checkout",
      "cart/completed"
    ]
  },
  "layout": {
    type: [Layout],
    optional: true
  },
  "theme": {
    type: ShopTheme,
    optional: true
  },
  "brandAssets": {
    type: [BrandAsset],
    optional: true
  },
  "appVersion": {
    type: String,
    optional: true
  },
  "createdAt": {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      }
      this.unset();
    },
    denyUpdate: true,
    optional: true
  },
  "updatedAt": {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date;
      }
    },
    optional: true
  },
  "paymentMethods": {
    type: [Object],
    blackbox: true,
    defaultValue: []
  },
  "workflow": {
    type: Workflow,
    optional: true
  }
});

registerSchema("Shop", Shop);

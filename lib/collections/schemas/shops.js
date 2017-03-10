import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Email } from "./accounts";
import { Address } from "./address";
import { Layout } from "./layouts";
import { Metafield } from "./metafield";

/**
 * CustomEmailSettings Schema
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

/**
 * Currency Schema
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

/**
 * Locale Schema
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

/**
 * Languages Schema
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

/**
 * ShopTheme Schema
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

/**
 * Shop Theme Schema
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

/**
 * Shop Schema
 */
export const Shop = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
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
  "baseUOM": {
    type: String,
    optional: true,
    defaultValue: "OZ",
    label: "Base Unit of Measure"
  },
  "unitsOfMeasure": {
    type: [Object]
  },
  "unitsOfMeasure.$.uom": {
    type: String,
    defaultValue: "OZ"
  },
  "unitsOfMeasure.$.label": {
    type: String,
    defaultValue: "Ounces"
  },
  "unitsOfMeasure.$.default": {
    type: Boolean,
    defaultValue: false
  },
  "metafields": {
    type: [Metafield],
    optional: true
  },
  "defaultVisitorRole": {
    type: [String],
    defaultValue: ["anonymous", "guest", "product", "tag", "index", "cart/checkout", "cart/completed"]
  },
  "defaultRoles": {
    type: [String],
    defaultValue: ["guest", "account/profile", "product", "tag", "index", "cart/checkout", "cart/completed"]
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
  }
});

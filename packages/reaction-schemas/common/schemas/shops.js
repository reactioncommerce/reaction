/**
 * CustomEmailSettings Schema
 */
ReactionCore.Schemas.CustomEmailSettings = new SimpleSchema({
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
    allowedValues: [25, 587, 465, 475, 2525],
    optional: true
  }
});

/**
 * Metafield Schema
 */
ReactionCore.Schemas.Metafield = new SimpleSchema({
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
 * Currency Schema
 */
ReactionCore.Schemas.Currency = new SimpleSchema({
  symbol: {
    type: String,
    defaultValue: "$"
  },
  format: {
    type: String,
    defaultValue: "%s%v"
  },
  precision: {
    type: String,
    defaultValue: "0",
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
ReactionCore.Schemas.Locale = new SimpleSchema({
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

ReactionCore.Schemas.Languages = new SimpleSchema({
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
ReactionCore.Schemas.ShopTheme = new SimpleSchema({
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
ReactionCore.Schemas.BrandAsset = new SimpleSchema({
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
ReactionCore.Schemas.Shop = new SimpleSchema({
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
    type: [ReactionCore.Schemas.Address],
    optional: true
  },
  "domains": {
    type: [String],
    defaultValue: ["localhost"],
    index: 1
  },
  "emails": {
    type: [ReactionCore.Schemas.Email],
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
    type: Object, // ReactionCore.Schemas.Currency
    blackbox: true,
    optional: true
  },
  "locales": {
    type: ReactionCore.Schemas.Locale
  },
  "language": {
    label: "Base Language",
    type: String,
    defaultValue: "en"
  },
  "languages": {
    type: [ReactionCore.Schemas.Languages],
    optional: true
  },
  "public": {
    type: String,
    optional: true
  },
  "timezone": {
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
    type: [ReactionCore.Schemas.Metafield],
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
    type: [ReactionCore.Schemas.Layout],
    optional: true
  },
  "theme": {
    type: ReactionCore.Schemas.ShopTheme,
    optional: true
  },
  "brandAssets": {
    type: [ReactionCore.Schemas.BrandAsset],
    optional: true
  },
  "createdAt": {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
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

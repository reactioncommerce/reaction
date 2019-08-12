import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { Email } from "./accounts";
import { Address } from "./address";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";
import { Layout } from "./layouts";
import { Metafield } from "./metafield";
import { Workflow } from "./workflow";


/**
 * @name BrandAsset
 * @memberof Schemas
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
 * @name Currency
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} symbol default value: `$`
 * @property {String} format default value: `%s%v`
 * @property {Number} scale optional, default value: `2`
 * @property {String} decimal optional, default value: `.`
 * @property {String} thousand optional, default value: `,`
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
    type: SimpleSchema.Integer,
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
 * @name CustomEmailSettings
 * @memberof Schemas
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
    type: SimpleSchema.Integer,
    optional: true
  }
});

registerSchema("CustomEmailSettings", CustomEmailSettings);

/**
 * @name Languages
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} i18n required
 * @property {Boolean} enabled, default value: `true`
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
 * @name Locale
 * @memberof Schemas
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
 * @name MerchantShop
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id Shop label
 * @property {String} slug Shop slug
 * @property {String} name Shop name
 */
export const MerchantShop = new SimpleSchema({
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
 * @name ParcelSize
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {Number} weight default value: 8lb
 * @property {Number} height default value: 6in
 * @property {Number} length default value: 11.25in
 * @property {Number} width default value: 8.75in
 */
export const ParcelSize = new SimpleSchema({
  weight: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  length: {
    type: Number,
    min: 0
  },
  width: {
    type: Number,
    min: 0
  }
});

registerSchema("ParcelSize", ParcelSize);

/**
 * @name ShopLogoUrls
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} primaryShopLogoUrl optional
 * @property {String} styles optional
 */
export const ShopLogoUrls = new SimpleSchema({
  primaryShopLogoUrl: {
    type: String,
    optional: true
  }
});

registerSchema("ShopLogoUrls", ShopLogoUrls);

/**
 * @name ShopTheme
 * @memberof Schemas
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
 * @name StorefrontUrls
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String[]} storefrontHomeUrl optional
 * @property {String[]} storefrontLoginUrl optional
 * @property {String[]} storefrontOrderUrl optional
 * @property {String[]} storefrontOrdersUrl optional
 * @property {String[]} storefrontAccountProfileUrl optional
 */
export const StorefrontUrls = new SimpleSchema({
  storefrontHomeUrl: {
    type: String,
    label: "Storefront Home URL",
    optional: true
  },
  storefrontLoginUrl: {
    type: String,
    label: "Storefront Login URL",
    optional: true
  },
  storefrontOrderUrl: {
    type: String,
    label: "Storefront single order URL (can include `:orderReferenceId` and `:orderToken` in string)",
    optional: true
  },
  storefrontOrdersUrl: {
    type: String,
    label: "Storefront orders URL (can include `:accountId` in string)",
    optional: true
  },
  storefrontAccountProfileUrl: {
    type: String,
    label: "Storefront Account Profile URL (can include `:accountId` in string)",
    optional: true
  }
});

registerSchema("StorefrontUrls", StorefrontUrls);

/**
 * @name Shop
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id optional
 * @property {String} slug optional, auto-generated
 * @property {MerchantShop[]} merchantShops optional
 * @property {String} shopType required, default value: `merchant`, accepted values: `primary`, `merchant`, `affiliate`
 * @property {Boolean} active required, default value: ` true`
 * @property {String} status default value: `active`
 * @property {String} name
 * @property {String} description optional
 * @property {String} keywords optional
 * @property {Address[]} addressBook optional
 * @property {String[]} domains default value: `[localhost]`
 * @property {Email[]} emails optional
 * @property {String} defaultPaymentMethod required, default value: `none`
 * @property {String} currency default value: `USD`
 * @property {Object} currencies optional, blackbox, `Currency` schema
 * @property {Locale} locales required
 * @property {String} language default value: `en`
 * @property {Languages[]} languages optional
 * @property {String} public optional
 * @property {String} timezone default value: `US/Pacific`
 * @property {String} baseUOL Base UOL (Unit of Length), default value: `in`, lowercased by default per style
 * @property {Object[]} unitsOfLength optional, default value: `in`
 * @property {String} unitsOfLength.$.uol  default value: `in`
 * @property {String} unitsOfLength.$.label default value: `Inches`
 * @property {Boolean} unitsOfLength.$.default default value: `false`
 * @property {String} baseUOM Base UOM (Unit of Measure), default value: `oz`, lowercased by default per style
 * @property {Object[]} unitsOfMeasure optional
 * @property {String} unitsOfMeasure.$.uom default value: `oz`
 * @property {String} unitsOfMeasure.$.label default value: `Ounces`
 * @property {Boolean} unitsOfMeasure.$.default default value: `false`
 * @property {Metafield[]} metafields optional
 * @property {String[]} defaultSellerRoles default values: `["owner", "admin", "seller", "guest", "manage-users", "orders", "account/profile", "product", "createProduct", "product/admin", tag", "index", "cart/completed"]`
 * @property {Layout[]} layout optional
 * @property {ShopTheme} theme optional
 * @property {BrandAsset[]} brandAssets optional
 * @property {Date} createdAt optional
 * @property {Date} updatedAt optional
 * @property {Object[]} paymentMethods blackbox, default value: `[]`
 * @property {String[]} availablePaymentMethods default value: `[]`
 * @property {Object[]} shopLogoUrls optional
 * @property {Object[]} storefrontUrls optional
 * @property {Workflow} workflow optional
 */
export const Shop = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "slug": {
    type: String,
    optional: true
  },
  "merchantShops": {
    type: Array,
    optional: true
  },
  "merchantShops.$": {
    type: MerchantShop
  },
  "shopType": {
    type: String,
    // Default value is merchant because we seed the first created shop with "primary"
    // In a marketplace, there should only be one "primary" shop
    defaultValue: "merchant" // "primary", "merchant", "affiliate",
  },
  "active": {
    type: Boolean,
    defaultValue: true
  },
  // not sure what this is used for. Prefer the boolean above for indexing
  "status": {
    type: String,
    defaultValue: "active"
  },
  "name": String,
  "description": {
    type: String,
    optional: true
  },
  "keywords": {
    type: String,
    optional: true
  },
  "addressBook": {
    type: Array,
    optional: true
  },
  "addressBook.$": {
    type: Address
  },
  "domains": {
    type: Array,
    defaultValue: ["localhost"]
  },
  "domains.$": String,
  "emails": {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Email
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
    type: Array,
    optional: true
  },
  "languages.$": {
    type: Languages
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
    type: Array,
    optional: true
  },
  "unitsOfLength.$": Object,
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
    type: Array,
    optional: true
  },
  "unitsOfMeasure.$": Object,
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
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "defaultSellerRoles": {
    type: Array,
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
      "product/admin",
      "tag",
      "index",
      "cart/completed"
    ]
  },
  "defaultSellerRoles.$": {
    type: String
  },
  "defaultParcelSize": {
    type: ParcelSize,
    optional: true
  },
  "layout": {
    type: Array,
    optional: true
  },
  "layout.$": {
    type: Layout
  },
  "theme": {
    type: ShopTheme,
    optional: true
  },
  "brandAssets": {
    type: Array,
    optional: true
  },
  "brandAssets.$": {
    type: BrandAsset
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue,
    optional: true
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  },
  "paymentMethods": {
    type: Array,
    defaultValue: []
  },
  "paymentMethods.$": {
    type: Object,
    blackbox: true
  },
  "availablePaymentMethods": {
    type: Array,
    defaultValue: []
  },
  "availablePaymentMethods.$": {
    type: String
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "defaultNavigationTreeId": {
    type: String,
    optional: true
  },
  "shopLogoUrls": {
    type: ShopLogoUrls,
    optional: true,
    defaultValue: {}
  },
  "storefrontUrls": {
    type: StorefrontUrls,
    optional: true,
    defaultValue: {}
  },
  "allowCustomUserLocale": {
    type: Boolean,
    defaultValue: true,
    optional: true,
    label: "Allow custom user locale"
  }
});

registerSchema("Shop", Shop);

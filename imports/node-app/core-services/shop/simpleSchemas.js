import SimpleSchema from "simpl-schema";

const withoutCodeCountries = ["AO", "AG", "AW", "BS", "BZ", "BJ", "BW",
  "BF", "BI", "CM", "CF", "KM", "CG", "CD", "CK", "CI", "DJ",
  "DM", "GQ", "ER", "FJ", "TF", "GM", "GH", "GD", "GN", "GY",
  "HK", "IE", "JM", "KE", "KI", "MO", "MW", "ML", "MR", "MU",
  "MS", "NR", "AN", "NU", "KP", "PA", "QA", "RW", "KN", "LC",
  "ST", "SA", "SC", "SL", "SB", "SO", "SR", "SY", "TZ", "TL",
  "TK", "TO", "TT", "TV", "UG", "AE", "VU", "YE", "ZW"];

/**
 * @name LayoutStructure
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Layout are used by the Shops and Packages schemas.
 * Layouts are used to in two ways: 1) Define the template layout on the site
 * 2) Define workflow components used in each layout block
 * @description Read more about Layouts in {@link https://docs.reactioncommerce.com/reaction-docs/master/layout documentation}
 * @property {String} template optional
 * @property {String} layoutHeader optional
 * @property {String} layoutFooter optional
 * @property {String} notFound optional
 * @property {String} dashboardHeader optional
 * @property {String} dashboardControls optional
 * @property {String} dashboardHeaderControls optional
 * @property {String} adminControlsFooter optional
 */
export const LayoutStructure = new SimpleSchema({
  template: {
    type: String,
    optional: true
  },
  layoutHeader: {
    type: String,
    optional: true
  },
  layoutFooter: {
    type: String,
    optional: true
  },
  notFound: {
    type: String,
    optional: true
  },
  dashboardHeader: {
    type: String,
    optional: true
  },
  dashboardControls: {
    type: String,
    optional: true
  },
  dashboardHeaderControls: {
    type: String,
    optional: true
  },
  adminControlsFooter: {
    type: String,
    optional: true
  }
});

/**
 * @name Layout
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Layout are used by the Shops and Packages schemas.
 * Read more about Layouts in {@link https://docs.reactioncommerce.com/reaction-docs/master/layout documentation}
 * @property {String} layout optional
 * @property {String} workflow optional
 * @property {String} template optional
 * @property {String} collection optional
 * @property {String} theme optional
 * @property {Boolean} enabled default value: `true`
 * @property {String} status optional
 * @property {String} label optional
 * @property {String} container optional
 * @property {String[]} audience optional
 * @property {LayoutStructure} structure optional
 * @property {Number} priority optional default value: `999` - Layouts are prioritized with lower numbers first.
 * @property {Number} position optional default value: `1`
 */
export const Layout = new SimpleSchema({
  "layout": {
    type: String,
    optional: true
  },
  "workflow": {
    type: String,
    optional: true
  },
  "template": {
    type: String,
    optional: true
  },
  "collection": {
    type: String,
    optional: true
  },
  "theme": {
    type: String,
    optional: true
  },
  "enabled": {
    type: Boolean,
    defaultValue: true
  },
  "status": {
    type: String,
    optional: true
  },
  "label": {
    type: String,
    optional: true
  },
  "container": {
    type: String,
    optional: true
  },
  "audience": {
    type: Array,
    optional: true
  },
  "audience.$": {
    type: String
  },
  "structure": {
    type: LayoutStructure,
    optional: true
  },
  "priority": {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 999
  },
  "position": {
    type: SimpleSchema.Integer,
    optional: true,
    defaultValue: 1
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
export const Workflow = new SimpleSchema({
  "status": {
    type: String,
    defaultValue: "new"
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
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

/**
 * @name ShopAddress
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {String} fullName required
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} address1 required
 * @property {String} address2
 * @property {String} city required
 * @property {String} company
 * @property {String} phone required
 * @property {String} region required, State/Province/Region
 * @property {String} postal required
 * @property {String} country required
 * @property {Boolean} isCommercial required
 * @property {Boolean} isBillingDefault required
 * @property {Boolean} isShippingDefault required
 * @property {Boolean} failedValidation
 * @property {Metafield[]} metafields
 */
export const ShopAddress = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "fullName": {
    type: String,
    label: "Full name"
  },
  "firstName": {
    type: String,
    label: "First name",
    optional: true
  },
  "lastName": {
    type: String,
    label: "Last name",
    optional: true
  },
  "address1": {
    label: "Address 1",
    type: String
  },
  "address2": {
    label: "Address 2",
    type: String,
    optional: true
  },
  "city": {
    type: String,
    label: "City"
  },
  "company": {
    type: String,
    label: "Company",
    optional: true
  },
  "phone": {
    type: String,
    label: "Phone"
  },
  "region": {
    label: "State/Province/Region",
    type: String
  },
  "postal": {
    label: "ZIP/Postal Code",
    type: String,
    optional: true,
    custom() {
      const country = this.field("country");
      if (country && country.value) {
        if (!withoutCodeCountries.includes(country.value) && !this.value) {
          return "required";
        }
      }
      return true;
    }
  },
  "country": {
    type: String,
    label: "Country"
  },
  "isCommercial": {
    label: "This is a commercial address.",
    type: Boolean,
    defaultValue: false
  },
  "isBillingDefault": {
    label: "Make this your default billing address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "isShippingDefault": {
    label: "Make this your default shipping address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "failedValidation": {
    label: "Failed validation",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  }
});

/**
 * @name Email
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} provides optional
 * @property {String} address required
 * @property {Boolean} verified optional
 */
export const Email = new SimpleSchema({
  provides: {
    type: String,
    defaultValue: "default",
    optional: true
  },
  address: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  verified: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

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
    type: ShopAddress
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
    optional: true
  },
  "updatedAt": {
    type: Date,
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

import SimpleSchema from "simpl-schema";

SimpleSchema.extendOptions(["mockValue"]);

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

const withoutCodeCountries = ["AO", "AG", "AW", "BS", "BZ", "BJ", "BW",
  "BF", "BI", "CM", "CF", "KM", "CG", "CD", "CK", "CI", "DJ",
  "DM", "GQ", "ER", "FJ", "TF", "GM", "GH", "GD", "GN", "GY",
  "HK", "IE", "JM", "KE", "KI", "MO", "MW", "ML", "MR", "MU",
  "MS", "NR", "AN", "NU", "KP", "PA", "QA", "RW", "KN", "LC",
  "ST", "SA", "SC", "SL", "SB", "SO", "SR", "SY", "TZ", "TL",
  "TK", "TO", "TT", "TV", "UG", "AE", "VU", "YE", "ZW"];

/**
 * @name AccountProfileAddress
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
export const AccountProfileAddress = new SimpleSchema({
  "_id": String,
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
 * @name TaxSettings
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} exemptionNo optional
 * @property {String} customerUsageType optional
 */
const TaxSettings = new SimpleSchema({
  exemptionNo: {
    type: String,
    optional: true
  },
  customerUsageType: {
    type: String,
    optional: true
  }
});

/**
 * @name Profile
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Address[]} addressBook optional, array of Addresses
 * @property {Boolean} invited optional
 * @property {String} name optional
 * @property {String} picture optional
 * @property {String} bio optional
 * @property {String} username optional
 * @property {String} currency User currency
 */
export const Profile = new SimpleSchema({
  "addressBook": {
    type: Array,
    optional: true
  },
  "addressBook.$": {
    type: AccountProfileAddress
  },
  "invited": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "name": {
    type: String,
    optional: true
  },
  "picture": {
    type: String,
    optional: true
  },
  "bio": {
    type: String,
    optional: true
  },
  "username": {
    type: String,
    optional: true
  },
  "currency": {
    label: "User Currency",
    type: String,
    optional: true,
    mockValue: null
  },
  "language": {
    label: "User language",
    type: String,
    optional: true
  },
  "preferences": {
    label: "User preferences",
    type: Object,
    blackbox: true,
    optional: true
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
const Email = new SimpleSchema({
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
 * @name Account
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} userId required
 * @property {String[]} sessions optional, Array of strings
 * @property {String} shopId optional
 * @property {String} name optional
 * @property {String} username optional
 * @property {Email[]} emails optional, Array of strings
 * @property {Boolean} acceptsMarketing optional
 * @property {String} state optional
 * @property {TaxSettings} taxSettings optional
 * @property {String} note optional
 * @property {Profile} profile optional
 * @property {String[]} groups optional, Array of groupIds of the groups the user belongs to
 * @property {Metafield[]} metafields optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 */
export const Account = new SimpleSchema({
  "userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "User ID"
  },
  "sessions": {
    type: Array,
    optional: true
  },
  "sessions.$": {
    type: String
  },
  "shopId": {
    type: String,
    optional: true
  },
  "name": {
    type: String,
    optional: true
  },
  "username": {
    type: String,
    optional: true
  },
  "emails": {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Email
  },
  "acceptsMarketing": {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "state": {
    type: String,
    defaultValue: "new",
    optional: true
  },
  "taxSettings": {
    type: TaxSettings,
    optional: true
  },
  "note": {
    type: String,
    optional: true
  },
  "profile": {
    type: Profile,
    optional: true
  },
  "groups": {
    type: Array, // groupIds that user belongs to
    optional: true,
    defaultValue: []
  },
  "groups.$": {
    type: String
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date,
    optional: true
  }
});

/**
 * @name Group
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} name required
 * @property {String} description optional
 * @property {String} slug required
 * @property {String[]} permissions optional
 * @property {String} shopId required
 * @property {String} createdBy optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const Group = new SimpleSchema({
  "name": {
    type: String
  },
  "description": {
    type: String,
    optional: true
  },
  "slug": {
    type: String
  },
  "permissions": {
    type: Array,
    optional: true
  },
  "permissions.$": {
    type: String
  },
  "shopId": {
    type: String
  },
  "createdBy": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id
  },
  "createdAt": Date,
  "updatedAt": Date
});

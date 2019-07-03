import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";
import { Address } from "./address";
import { Metafield } from "./metafield";

SimpleSchema.extendOptions(["mockValue"]);

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

registerSchema("TaxSettings", TaxSettings);

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
    type: Address
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
    label: "User Language",
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

registerSchema("Profile", Profile);

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

registerSchema("Email", Email);

/**
 * @name Accounts
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
export const Accounts = new SimpleSchema({
  "userId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label: "Accounts userId"
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
    type: Date,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  }
});

registerSchema("Accounts", Accounts);

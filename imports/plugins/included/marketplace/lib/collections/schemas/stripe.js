import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name StripeConnectAuthorizationCredentials
 * @memberof Schemas
 * @type {SimpleSchema}
 * @see {@link https://stripe.com/docs/api}
 */
const StripeConnectAuthorizationCredentials = new SimpleSchema({
  token_type: { // eslint-disable-line camelcase
    type: String
  },
  stripe_publishable_key: { // eslint-disable-line camelcase
    type: String
  },
  scope: {
    type: String
  },
  livemode: {
    type: Boolean
  },
  stripe_user_id: { // eslint-disable-line camelcase
    type: String
  },
  refresh_token: { // eslint-disable-line camelcase
    type: String
  },
  access_token: { // eslint-disable-line camelcase
    type: String
  }
}, { check, tracker: Tracker });

/**
 * @name StripeMarketplacePackageConfig
 * @memberof Schemas
 * @type {SimpleSchema}
 */
export const StripeMarketplacePackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.mode": {
    type: Boolean,
    defaultValue: false
  },
  "settings.api_key": {
    type: String,
    label: "API Secret Key"
  },
  // This field only applies to marketplace style orders where a payment is taken on behalf of another store
  "settings.applicationFee": {
    type: Number,
    label: "Percentage Application Fee",
    optional: true,
    defaultValue: 5
  },
  "settings.connectAuth": {
    type: StripeConnectAuthorizationCredentials,
    label: "Connect Authorization Credentials",
    optional: true
  },
  "settings.public": {
    type: Object,
    defaultValue: {}
  },
  // Public Settings
  "settings.public.client_id": {
    type: String,
    label: "Public Client ID",
    optional: true
  },
  "settings.public.publishable_key": {
    type: String,
    label: "Publishable Key",
    optional: true
  }
});

registerSchema("StripeMarketplacePackageConfig", StripeMarketplacePackageConfig);

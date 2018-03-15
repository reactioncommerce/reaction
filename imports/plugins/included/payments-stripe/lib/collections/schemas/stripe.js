import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";
/*
 *  Meteor.settings.stripe =
 *    mode: false  #sandbox
 *    api_key: ""
 *  see: https://stripe.com/docs/api
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

registerSchema("StripeConnectAuthorizationCredentials", StripeConnectAuthorizationCredentials);

export const StripePackageConfig = PackageConfig.clone().extend({
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
  "settings.reaction-stripe.support": {
    type: Array,
    label: "Payment provider supported methods"
  },
  "settings.reaction-stripe.support.$": {
    type: String,
    allowedValues: ["Authorize", "De-authorize", "Capture", "Refund"]
  },

  // Public Settings
  "settings.public.client_id": {
    type: String,
    label: "Public Client ID",
    optional: true
  }
});

registerSchema("StripePackageConfig", StripePackageConfig);

export const StripePayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name"
  },
  cardNumber: {
    type: String,
    min: 13,
    max: 16,
    label: "Card number"
  },
  expireMonth: {
    type: String,
    max: 2,
    label: "Expiration month"
  },
  expireYear: {
    type: String,
    max: 4,
    label: "Expiration year"
  },
  cvv: {
    type: String,
    max: 4,
    label: "CVV"
  }
}, { check, tracker: Tracker });

registerSchema("StripePayment", StripePayment);

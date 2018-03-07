import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "/imports/plugins/core/collections";

/**
 * @file ShopifyProduct
 *
 * @module connectors-shopify
 */

/**
 * @name Webhook
 * @type {SimpleSchema}
 * @property {Number} shopifyId Shopify webhook ID
 * @property {String} topic Shopify webhook topic
 * @property {String} address URL webhook will POST to
 * @property {String} format Format of webhook data
 * @property {Array} integrations Array of integration strings using this webhook
 * @property {String} description Shopify webhook description, currently unused
 */
const Webhook = new SimpleSchema({
  "shopifyId": {
    type: SimpleSchema.Integer,
    label: "Shopify webhook ID"
  },
  "topic": {
    type: String,
    label: "Shopify webhook topic"
  },
  "address": {
    type: String,
    label: "URL webhook will POST to"
  },
  "format": {
    type: String,
    label: "Format of webhook data"
  },
  "integrations": {
    type: Array,
    label: "Integrations currently using this webhook",
    optional: true
  },
  "integrations.$": {
    type: String
  },
  // Currently unused, might want it later
  "description": {
    type: String,
    label: "Shopify webhook description",
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Webhook", Webhook);

/**
 * @name Synchook
 * @type {SimpleSchema}
 * @property {String} topic - General topic this event is under
 * @property {String} event - The type of event that we are capturing
 * @property {String} syncType - The handler to run for this event
 */
export const Synchook = new SimpleSchema({
  topic: {
    type: String,
    label: "Outbound Sync Topic",
    allowedValues: ["orders"] // expand as necessary
  },
  event: {
    type: String,
    label: "Event to act upon"
  },
  syncType: {
    type: String,
    label: "Exactly what to sync in this topic"
  }
}, { check, tracker: Tracker });

registerSchema("Synchook", Synchook);

/**
 * @name ShopifyConnectPackageConfig
 * @type {SimpleSchema}
 * @property {String} settings.apiKey Shopify API key
 * @property {String} settings.password Shopify API password
 * @property {String} settings.sharedSecret Shopify API shared secret
 * @property {String} settings.shopName Shop slug
 * @property {Array} settings.webhooks Array of registered Shopify webhooks
 */
export const ShopifyConnectPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.apiKey": {
    type: String,
    label: "API key",
    optional: true
  },
  "settings.password": {
    type: String,
    label: "API password",
    optional: true
  },
  "settings.sharedSecret": {
    type: String,
    label: "API shared secret",
    optional: true
  },
  "settings.shopName": {
    type: String,
    label: "Shop slug",
    optional: true
  },
  "settings.synchooks": {
    type: Array,
    label: "Hooks being used to sync outbound with Shopify",
    optional: true
  },
  "settings.synchooks.$": {
    type: Synchook
  },
  "settings.webhooks": {
    type: Array,
    label: "Registered Shopify webhooks",
    optional: true
  },
  "settings.webhooks.$": {
    type: Webhook
  }
});

registerSchema("ShopifyConnectPackageConfig", ShopifyConnectPackageConfig);

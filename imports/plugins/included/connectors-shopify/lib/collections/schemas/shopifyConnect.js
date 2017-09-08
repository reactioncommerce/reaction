import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

const Webhook = new SimpleSchema({
  shopifyId: {
    type: Number,
    label: "Shopify Webhook ID",
    decimal: false
  },
  topic: {
    type: String,
    label: "Shopify Webhook Topic"
  },
  address: {
    type: String,
    label: "url that this webhook will POST to"
  },
  format: {
    type: String,
    label: "Format of webhook data"
  },
  integrations: {
    type: [String],
    label: "Integrations currently using this webhook",
    optional: true
  },
  // Currently unused, might want it later
  description: {
    type: String,
    label: "Shopify Webhook Description",
    optional: true
  }
});

export const ShopifyConnectPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.apiKey": {
      type: String,
      label: "API Key",
      optional: true
    },
    "settings.password": {
      type: String,
      label: "API Password",
      optional: true
    },
    "settings.sharedSecret": {
      type: String,
      label: "API Shared Secret",
      optional: true
    },
    "settings.shopName": {
      type: String,
      label: "Shop Slug",
      optional: true
    },
    "settings.webhooks": {
      type: [Webhook],
      label: "Registered Shopify Webhooks",
      optional: true
    }
  }
]);

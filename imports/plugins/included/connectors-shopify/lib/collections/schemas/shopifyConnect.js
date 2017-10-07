import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "/imports/plugins/core/collections";

const Webhook = new SimpleSchema({
  shopifyId: {
    type: Number,
    label: "Shopify webhook ID",
    decimal: false
  },
  topic: {
    type: String,
    label: "Shopify webhook topic"
  },
  address: {
    type: String,
    label: "URL webhook will POST to"
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
    label: "Shopify webhook description",
    optional: true
  }
});

registerSchema("Webhook", Webhook);

export const ShopifyConnectPackageConfig = new SimpleSchema([
  PackageConfig, {
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
    "settings.webhooks": {
      type: [Webhook],
      label: "Registered Shopify webhooks",
      optional: true
    }
  }
]);

registerSchema("ShopifyConnectPackageConfig", ShopifyConnectPackageConfig);

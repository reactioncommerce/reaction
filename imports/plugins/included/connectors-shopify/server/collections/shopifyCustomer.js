import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Accounts } from "/lib/collections";
import { registerSchema } from "/imports/plugins/core/collections";

/**
 * @file ShopifyCustomer
 *
 * @module connectors-shopify
 */

/**
 * @name ShopifyCustomer
 * @summary ShopifyCustomer schema attached to Accounts
 * @type {SimpleSchema}
 * @property {Number} shopifyId Shopify ID
 */
export const ShopifyCustomer = new SimpleSchema({
  shopifyId: {
    type: Number,
    optional: true,
    decimal: false
  },
  orders_count: {
    type: Number,
    optional: true,
    decimal: false
  },
  tags: {
    type: String,
    optional: true
  }
});

registerSchema("ShopifyCustomer", ShopifyCustomer);

Accounts.attachSchema(ShopifyCustomer);

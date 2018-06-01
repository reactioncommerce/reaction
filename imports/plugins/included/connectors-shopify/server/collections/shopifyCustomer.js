/* eslint camelcase: 0 */
import SimpleSchema from "simpl-schema";
import { Accounts } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file ShopifyCustomer
 *
 * @module connectors-shopify
 */

/**
 * @name ShopifyCustomer
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary ShopifyCustomer schema attached to Accounts
 * @property {Number} shopifyId Shopify ID
 */
export const ShopifyCustomer = new SimpleSchema({
  shopifyId: {
    type: SimpleSchema.Integer,
    optional: true
  },
  orders_count: {
    type: SimpleSchema.Integer,
    optional: true
  },
  tags: {
    type: String,
    optional: true
  }
});

registerSchema("ShopifyCustomer", ShopifyCustomer);

Accounts.attachSchema(ShopifyCustomer);

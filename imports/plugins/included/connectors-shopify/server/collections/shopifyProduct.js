import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { Products } from "/lib/collections";
import { registerSchema } from "/imports/plugins/core/collections";

/**
 * @file ShopifyProduct
 *
 * @module connectors-shopify
 */

/**
 * @name ShopifyProduct
 * @summary ShopifyProduct schema attached to Products type "simple" and "variant"
 * @type {SimpleSchema}
 * @property {Number} shopifyId Shopify ID
 */
export const ShopifyProduct = new SimpleSchema({
  shopifyId: {
    type: SimpleSchema.Integer,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("ShopifyProduct", ShopifyProduct);

Products.attachSchema(ShopifyProduct, { selector: { type: "simple" } });
Products.attachSchema(ShopifyProduct, { selector: { type: "variant" } });

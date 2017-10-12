import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { getApiInfo } from "./api";
import { connectorsRoles } from "../../lib/roles";

/**
 * @file Shopify connector wrapper for api calls for products
 *       wraps shopify product api calls in reaction methods
 * @module connectors-shopify
 */

export const methods = {
  /**
   * Gets a count of the products from Shopify with the API credentials setup for your store.
   *
   * @async
   * @method connectors/shopify/api/products/count
   * @param {object} options An object of options for the shopify API call. Available options here: https://help.shopify.com/api/reference/product#count
   * @returns {number} Number of products
   */
  async "connectors/shopify/api/products/count"(options) {
    check(options, Match.Maybe(Object));

    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);
    const opts = Object.assign({}, { published_status: "published" }, { ...options }); // eslint-disable-line camelcase

    try {
      const count = await shopify.product.count(opts);
      return count;
    } catch (err) {
      Logger.error("Something went wrong during Shopify products count");
    }
  }
};

Meteor.methods(methods);

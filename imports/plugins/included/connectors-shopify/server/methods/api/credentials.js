import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { getApiInfo } from "./api";
import { connectorsRoles } from "../../lib/roles";

/**
 * @file Shopify connector wrapper for api calls for
 *       checking credentials's validity
 * @module connectors-shopify
 */

export const methods = {
  /**
   * Gets a count of the products from Shopify with the API credentials setup for your store.
   *
   * @async
   * @method connectors/shopify/api/credentials/test
   * @param {object} options An object of options for the shopify API call.
   * @returns {boolean} credentials valid or not
   */
  async "connectors/shopify/api/credentials/test"() {
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);

    try {
      await shopify.product.count();
    } catch (err) {
      return false;
    }
    return true;
  }
};

Meteor.methods(methods);

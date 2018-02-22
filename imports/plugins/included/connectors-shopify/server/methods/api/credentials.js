import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { connectorsRoles } from "../../lib/roles";
import { getApiInfo } from "./api";

/**
 * @file Shopify connector wrapper for api calls for
 *       checking credentials's validity
 * @module connectors-shopify
 */

export const methods = {
  /**
   * Check if Shopify API's credentials are valid or not.
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
    try {
      const shopify = new Shopify(apiCreds);
      await shopify.product.count();
    } catch (err) {
      return false;
    }
    return true;
  }
};

Meteor.methods(methods);

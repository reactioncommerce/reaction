import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Taxes } from "../lib/collections";

/**
 * @file Methods for Custom Tax Rates. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace TaxesRates/Methods
*/

const methods = {
  /**
   * @name taxes/deleteRate
   * @method
   * @memberof TaxesRates/Methods
   * @param  {String} taxId tax taxId to delete
   * @returns {String} returns update/insert result
   */
  "taxes/deleteRate"(taxId) {
    check(taxId, String);

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("taxes", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    return Taxes.remove({ _id: taxId, shopId });
  },

  /**
   * @name taxes/addRate
   * @method
   * @memberof TaxesRates/Methods
   * @param  {Object} doc A Taxes document to be inserted
   * @returns {String} Insert result
   */
  "taxes/addRate"(doc) {
    check(doc, Object); // actual schema validation happens during insert below

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("taxes", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    doc.shopId = shopId;
    return Taxes.insert(doc);
  },

  /**
   * @name taxes/editRate
   * @method
   * @memberof TaxesRates/Methods
   * @param  {Object} details An object with _id and modifier props
   * @returns {String} Update result
   */
  "taxes/editRate"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("taxes", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const { _id, modifier } = details;
    return Taxes.update({ _id, shopId }, modifier);
  }
};

Meteor.methods(methods);

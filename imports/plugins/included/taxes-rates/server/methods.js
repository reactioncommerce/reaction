import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
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
   * @return {String} returns update/insert result
   */
  "taxes/deleteRate"(taxId) {
    check(taxId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("taxes")) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    return Taxes.remove(taxId);
  },

  /**
   * @name taxes/addRate
   * @method
   * @memberof TaxesRates/Methods
   * @param  {Object} doc A Taxes document to be inserted
   * @param  {String} [docId] DEPRECATED. Existing ID to trigger an update. Use taxes/editRate method instead.
   * @return {String} Insert result
   */
  "taxes/addRate"(doc, docId) {
    check(doc, Object); // actual schema validation happens during insert below

    // Backward compatibility
    check(docId, Match.Optional(String));
    if (docId) return Meteor.call("taxes/editRate", { _id: docId, modifier: doc });

    if (!Reaction.hasPermission("taxes")) throw new ReactionError("access-denied", "Access Denied");
    doc.shopId = Reaction.getShopId();
    return Taxes.insert(doc);
  },

  /**
   * @name taxes/editRate
   * @method
   * @memberof TaxesRates/Methods
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "taxes/editRate"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("taxes")) throw new ReactionError("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Taxes.update(_id, modifier);
  }
};

Meteor.methods(methods);

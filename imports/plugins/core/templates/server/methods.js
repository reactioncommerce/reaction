import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Templates } from "/lib/collections";
import { EmailTemplates } from "./simpleSchemas";

/**
 * @file Methods for Templates. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Templates/Methods
*/

export const methods = {
  /**
   * @name templates/email/update
   * @method
   * @memberof Templates/Methods
   * @summary Updates email template in Templates collection
   * @param {Object} details Details
   * @param {String} details._id - id of template to update
   * @param {Object} details.modifier - data to update
   * @returns {Number} update template
   */
  "templates/email/update"(details) {
    check(details, Object);

    const shopId = Reaction.getShopId();
    const userId = Reaction.getUserId();

    // Check that this user has permission to update templates for the active shop
    if (!Reaction.hasPermission("reaction-templates", userId, shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const { _id, modifier } = details;

    EmailTemplates.validate(modifier, { modifier: true });

    return Templates.update({
      _id,
      type: "email",
      shopId // Ensure that the template we're attempting to update is owned by the active shop.
    }, modifier);
  }
};

Meteor.methods(methods);

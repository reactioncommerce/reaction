import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Cart } from "/lib/collections";
import appEvents from "/imports/plugins/core/core/server/appEvents";
import { Discounts } from "../../lib/collections";
import Reaction from "../api";

/**
 *
 * @namespace Discounts/Methods
 */

export const methods = {
  /**
   * @name discounts/deleteRate
   * @method
   * @memberof Discounts/Methods
   * @param  {String} discountId discount id to delete
   * @return {String} returns update/insert result
   */
  "discounts/deleteRate"(discountId) {
    check(discountId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("discounts")) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    return Discounts.remove({ _id: discountId });
  },

  /**
   * @name discounts/setRate
   * @method
   * @memberof Discounts/Methods
   * @summary Update the cart discounts without hooks
   * @param  {String} cartId cartId
   * @param  {Number} discountRate discountRate
   * @param  {Object} discounts discounts
   * @return {Number} returns update result
   */
  "discounts/setRate"(cartId, discountRate, discounts) {
    check(cartId, String);
    check(discountRate, Number);
    check(discounts, Match.Optional(Array));

    const result = Cart.update({ _id: cartId }, {
      $set: {
        discounts,
        discount: discountRate
      }
    });

    const updatedCart = Cart.findOne({ _id: cartId });
    Promise.await(appEvents.emit("afterCartUpdate", cartId, updatedCart));

    return result;
  },

  /**
   * @name discounts/editRate
   * @method
   * @memberof Discounts/Rates/Methods
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "discounts/editRate"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("discount-rates")) throw new ReactionError("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Discounts.update(_id, modifier);
  }
};

Meteor.methods(methods);

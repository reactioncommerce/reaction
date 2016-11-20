import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart } from "/lib/collections";
import { Discounts } from "../../lib/collections";
import Reaction from "../api";
import { Logger } from "/server/api";

//
// make all discount methods available
//
export const methods = {
  /**
   * discounts/deleteRate
   * @param  {String} discountId discount id to delete
   * @return {String} returns update/insert result
   */
  "discounts/deleteRate": function (discountId) {
    check(discountId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("discounts")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Discounts.remove(discountId);
  },

  /**
   * discounts/setRate
   * @param  {String} cartId cartId
   * @param  {Number} discountRate discountRate
   * @param  {Object} discounts discounts
   * @return {Number} returns update result
   */
  "discounts/setRate": function (cartId, discountRate, discounts) {
    check(cartId, String);
    check(discountRate, Number);
    check(discounts, Match.Optional(Array));

    return Cart.update(cartId, {
      $set: {
        discounts: discounts,
        discount: discountRate
      }
    });
  },

  /**
   * discounts/calculate
   * @param  {String} cartId cartId
   * @return {Object}  returns discount object
   */
  "discounts/calculate": function (cartId) {
    check(cartId, String);
    const cartToCalc = Cart.findOne(cartId);
    // const shopId = cartToCalc.shopId;
    const discountRate = 0;
    if (cartToCalc.discountMethods) {
      for (discountMethods of cartToCalc.discountMethods) {
        // get discount based on id in cartMethods.
        // validate the discount rules.
        // return discount rate.
        //
      }
    }
  }// end discounts/calculate
};

// export methods to Meteor
Meteor.methods(methods);

import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart } from "/lib/collections";
import { Discounts } from "../../lib/collections";
import Reaction from "../api";

/**
 *
 * @namespace Methods/Discounts
 */

export const methods = {
  /**
   * @name discounts/deleteRate
   * @method
   * @memberof Methods/Discounts
   * @param  {String} discountId discount id to delete
   * @return {String} returns update/insert result
   */
  "discounts/deleteRate"(discountId) {
    check(discountId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("discounts")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return Discounts.remove({ _id: discountId });
  },

  /**
   * @name discounts/setRate
   * @method
   * @memberof Methods/Discounts
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

    return Cart.update(cartId, {
      $set: {
        discounts,
        discount: discountRate
      }
    });
  },

  /**
   * @name discounts/transaction
   * @method
   * @memberof Methods/Discounts
   * @summary Applies a transaction to discounts for history
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {String} returns update result
   */
  "discounts/transaction"(cartId, discountId) {
    check(cartId, String);
    check(discountId, String);

    const transaction = {
      cartId,
      userId: Meteor.userId(),
      appliedAt: new Date()
    };
    // double duty validation, plus we need the method
    const discount = Discounts.findOne(discountId);
    return Discounts.update(
      { _id: discountId },
      { $addToSet: { transactions: transaction } },
      { selector: { discountMethod: discount.discountMethod } }
    );
  },

  /**
   * @name discounts/calculate
   * @method
   * @memberof Methods/Discounts
   * @param  {String} cart cartId
   * @return {Object}  returns discount object
   */
  "discounts/calculate"(cart) {
    Reaction.Schemas.Cart.validate(cart);

    let currentDiscount = 0;
    // what's going on here?
    // well, we're getting the real details of the discounts from
    // the collection, because the publicly stored cart
    // paymentMethod doesn't quite have all of the pieces (intentionally)
    if (cart && cart.billing) {
      for (const billing of cart.billing) {
        if (billing.paymentMethod) {
          const discount = Discounts.findOne(billing.paymentMethod.id);
          if (discount && discount.calculation) {
            const { processor } = billing.paymentMethod;
            const calculation = discount.calculation.method;
            // we're using processor/calculation
            // as a convention that can be easily
            // added in external discount methods
            // example: discounts/codes/discount
            // will also not reprocess invoiced orders
            if ((!billing.invoice && processor === "code") || processor === "rate") {
              // discounts are additive, if we allow more than one.
              currentDiscount += Meteor.call(`discounts/${processor}s/${calculation}`, cart._id, discount._id);// note the added s.
            }
          }
        }
      }
    }
    return currentDiscount;
  }
};

Meteor.methods(methods);

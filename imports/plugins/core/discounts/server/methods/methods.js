import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Discounts } from "../../lib/collections";
import Reaction from "../api";

/**
 *
 * @namespace Discounts/Methods
 */

export const methods = {
  /**
   * @name discounts/transaction
   * @method
   * @memberof Discounts/Methods
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
   * @memberof Discounts/Methods
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

import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart } from "/lib/collections";
import { Discounts } from "../../lib/collections";
import Reaction from "../api";

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

    return Discounts.direct.remove({ _id: discountId });
  },

  /**
   * discounts/setRate
   * update the cart discounts without hooks
   * @param  {String} cartId cartId
   * @param  {Number} discountRate discountRate
   * @param  {Object} discounts discounts
   * @return {Number} returns update result
   */
  "discounts/setRate": function (cartId, discountRate, discounts) {
    check(cartId, String);
    check(discountRate, Number);
    check(discounts, Match.Optional(Array));

    return Cart.direct.update(cartId, {
      $set: {
        discounts: discounts,
        discount: discountRate
      }
    });
  },

  /**
   * discounts/calculate
   * @param  {String} cart cartId
   * @return {Object}  returns discount object
   */
  "discounts/calculate": function (cart) {
    check(cart, Object); // Reaction.Schemas.Cart
    let hasInvoice = false;
    let currentDiscount = 0;
    // what's going on here?
    // well, we're getting the real details of the discounts from
    // the collection, because the publicly stored cart
    // paymentMethod doesn't quite have all of the pieces (intentionally)
    for (const billing of cart.billing) {
      if (billing.paymentMethod) {
        const discount = Discounts.findOne(billing.paymentMethod.id);
        if (discount) {
          const processor = billing.paymentMethod.processor;
          const calculation = discount.calculation.method
          // we're using processor/calculation
          // as a convention that can be easily
          // added in external discount methods
          // example: discounts/codes/discount
          // will also not reprocess invoiced orders
          if (!billing.invoice && processor === "code" || processor === "rate") {
            // discounts are additive, if we allow more than one.
            currentDiscount += Meteor.call(`discounts/${processor}s/${calculation}`, cart._id, discount._id);// note the added s.
          }
        }
      }
    }
    // TODO: discount transaction records
    // we need transaction records of the discount status
    // ie: has the user used this before, in other carts?
    // increment the discount use counter, etc.
    return currentDiscount;
  }
};

// export methods to Meteor
Meteor.methods(methods);

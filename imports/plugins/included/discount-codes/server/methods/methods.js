import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Reaction } from "/server/api";
import { Cart } from "/lib/collections";
import { Discounts } from  "/imports/plugins/core/discounts/lib/collections";
import { DiscountCodes as DiscountSchema } from "../../lib/collections/schemas";

// attach discount code specific schema
Discounts.attachSchema(DiscountSchema, { selector: { discountMethod: "code" } });

//
// make all discount methods available
//
export const methods = {
  /**
   * discounts/addCode
   * @param  {String} modifier update statement
   * @param  {String} docId discount docId
   * @param  {String} qty create this many additional codes
   * @return {String} returns update/insert result
   */
  "discounts/addCode": function (modifier, docId) {
    check(modifier, Object);
    check(docId, Match.OneOf(String, null, undefined));

    // check permissions to add
    if (!Reaction.hasPermission("discount-codes")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // if no doc, insert
    if (!docId) {
      return Discounts.insert(modifier);
    }
    // else update and return
    return Discounts.update(docId, modifier);
  },
  /**
   * discounts/codes/remove
   * removes discounts that have been previously applied
   * to a cart.
   * @param  {String} cartId cart id of which to remove a code
   * @param  {String} codeId discount Id from cart.billing
   * @return {String} returns update/insert result
   */
  "discounts/codes/remove": function (cartId, codeId) {
    check(cartId, String);
    check(codeId, String);

    //
    // delete code from cart
    // TODO: update a history record of transaction
    //

    // TODO: recalculate cart discounts (not simply 0)
    return Cart.update(
      { _id: cartId },
      { $set: { discount: 0 }, $pull: { billing: { _id: codeId } } },
      { multi: true }
    );
  },
  /**
   * discounts/codes/apply
   * checks validity of code conditions and then
   * applies a discount as a paymentMethod to cart
   * @param  {String} cartId cart id of which to remove a code
   * @param  {String} code valid discount code
   * @return {Boolean} returns true if successfully applied
   */
  "discounts/codes/apply": function (cartId, code) {
    check(cartId, String);
    check(code, String);

    // TODO: further expand to meet all condition rules
    // const conditions = {
    //   enabled: true
    // };

    // TODO: add  conditions: conditions
    const discount = Discounts.findOne({ code: code });

    // TODO: check usage limit
    // don't apply if cart has exceeded usage limit
    // will also need to check all time usage.
    // which means storing the use data with the Discounts
    // or searching all user's order history
    // and if a user cancels an order,
    // is the discount now re-activated


    if (discount) {
      // save to payment methods
      // and update status in Discounts
      // payment methods can be debit or credit.
      const paymentMethod = {
        processor: "discount-code",
        method: "debit",
        code: discount.code,
        transactionId: Random.id(),
        amount: discount.discount, // pre-process to amount.
        status: "created"
      };
      // apply to cart
      Meteor.call("payments/cart/apply", cartId, paymentMethod, (error, result) => {
        if (result) {
          const currentCart = Cart.findOne(cartId);
          let currentDiscount = 0;
          for (billing of currentCart.billing) {
            if (billing.paymentMethod && billing.paymentMethod.processor === "discount-code") {
              currentDiscount += parseFloat(billing.paymentMethod.amount);
            }
          }

          Cart.update(cartId, { $set: { discount: currentDiscount } });

          // TODO: discount transaction records
          // we need transaction records of the discount status
          // ie: has the user used this before, in other carts?
          // increment the discount use counter, etc.
        }
      });
      // and update Discounts status.
      return true;
    }
    return false;
  }
};

// export methods to Meteor
Meteor.methods(methods);

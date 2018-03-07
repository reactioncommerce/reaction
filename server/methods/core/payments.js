import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check } from "meteor/check";
import { Reaction, Hooks } from "/server/api";

/**
 * @file Methods for Payments. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/Payments
*/

export const methods = {
  /**
   * @name payments/apply
   * @method
   * @memberof Methods/Payments
   * @example Meteor.call("payments/apply", id, paymentMethod, collection)
   * @summary Adds payment to order
   * @param {String} id - id
   * @param {Object} paymentMethod - formatted payment method object
   * @param  {String} collection collection (either Orders or Cart)
   * @returns {String} return cart update result
   */
  "payments/apply"(id, paymentMethod, collection = "Cart") {
    check(id, String);
    check(paymentMethod, Object);
    check(collection, String);
    const Collection = Reaction.Collections[collection];

    const cart = Collection.findOne(id);
    // The first record holds the selected billing address
    const billing = cart.billing[0];
    const billingId = Random.id();
    const result = Collection.update({
      _id: id
    }, {
      $addToSet: {
        billing: {
          ...billing,
          _id: billingId,
          paymentMethod
        }
      }
    });
    // calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", id);

    return result;
  }
};

// export methods to Meteor
Meteor.methods(methods);

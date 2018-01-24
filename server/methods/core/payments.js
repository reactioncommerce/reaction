import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";

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
  "payments/apply": function (id, paymentMethod, collection = "Cart") {
    check(id, String);
    check(paymentMethod, Object);
    check(collection, String);
    const Collection = Reaction.Collections[collection];

    return Collection.update({
      _id: id
    }, {
      $addToSet: {
        billing: { paymentMethod: paymentMethod }
      }
    });
  }
};

// export methods to Meteor
Meteor.methods(methods);

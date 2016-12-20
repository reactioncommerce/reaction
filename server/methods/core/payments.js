import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";

export const methods = {
  /**
   * payments/apply
   * @summary adds payment to order
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

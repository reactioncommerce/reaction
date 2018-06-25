import Hooks from "@reactioncommerce/hooks";
import Random from "@reactioncommerce/random";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name payments/apply
 * @method
 * @memberof Payments/Methods
 * @example Meteor.call("payments/apply", id, paymentMethod, collection)
 * @summary Adds payment to order
 * @param {String} id - id
 * @param {Object} paymentMethod - formatted payment method object
 * @param  {String} collection collection (either Orders or Cart)
 * @returns {String} return cart update result
 */
export default function apply(id, paymentMethod, collection = "Cart") {
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

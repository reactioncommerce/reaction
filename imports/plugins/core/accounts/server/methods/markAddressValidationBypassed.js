import { check } from "meteor/check";
import { Accounts, Cart } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name accounts/markAddressValidationBypassed
 * @memberof Accounts/Methods
 * @method
 * @summary Write that the customer has bypassed address validation
 * @param {Boolean} [value] Default true
 * @returns {Number} updateResult - Result of the update
 */
export default function markAddressValidationBypassed(value = true) {
  check(value, Boolean);
  const userId = Reaction.getUserId();
  const account = Accounts.findOne({ userId }, { fields: { _id: 1 } });
  const updateResult = Cart.update({ accountId: account._id }, { $set: { bypassAddressValidation: value } });

  const updatedCart = Cart.findOne({ accountId: account._id });
  if (updatedCart) {
    Promise.await(appEvents.emit("afterCartUpdate", {
      cart: updatedCart,
      updatedBy: userId
    }));
  }

  return updateResult;
}

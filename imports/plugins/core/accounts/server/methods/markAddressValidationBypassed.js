import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart } from "/lib/collections";

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
  const userId = Meteor.userId();
  const updateResult = Cart.update({ userId }, { $set: { bypassAddressValidation: value } });
  return updateResult;
}

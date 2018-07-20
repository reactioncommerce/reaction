import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts, Cart } from "/lib/collections";

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
  const account = Accounts.findOne({ userId }, { fields: { _id: 1 } });
  const updateResult = Cart.update({ accountId: account._id }, { $set: { bypassAddressValidation: value } });
  return updateResult;
}

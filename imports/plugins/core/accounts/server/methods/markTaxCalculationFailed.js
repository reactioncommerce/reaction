import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts, Cart } from "/lib/collections";

/**
 * @name accounts/markTaxCalculationFailed
 * @memberof Accounts/Methods
 * @method
 * @summary Write tax calculation has failed for this customer
 * @param {Boolean} [value] - Default true
 * @returns {Number} updateResult - Result of the update
 */
export default function markTaxCalculationFailed(value = true) {
  check(value, Boolean);
  const userId = Meteor.userId();
  const account = Accounts.findOne({ userId }, { fields: { _id: 1 } });
  const updateResult = Cart.update({ accountId: account._id }, { $set: { taxCalculationFailed: value } });
  return updateResult;
}

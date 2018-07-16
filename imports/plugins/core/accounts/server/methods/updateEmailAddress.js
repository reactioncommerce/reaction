import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";

/**
 * @name accounts/updateEmailAddress
 * @memberof Accounts/Methods
 * @method
 * @summary Update a user's email address
 * @param {String} email - user email
 * @returns {Boolean} - return True on success
 */
export default function updateEmailAddress(email) {
  check(email, String);
  const user = Meteor.user();

  // Add email to user account
  MeteorAccounts.addEmail(user._id, email);

  return true;
}

import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { Accounts } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import sendVerificationEmail from "../util/sendVerificationEmail";

/**
 * @name accounts/syncUsersAndAccounts
 * @memberof Accounts/Methods
 * @method
 * @summary Syncs emails associated with a user profile between the Users and Accounts collections.
 * @returns {Boolean} - returns boolean.
 */
function syncUsersAndAccounts() {
  const user = Meteor.user();
  const userId = user._id;

  Accounts.update({
    userId
  }, {
    $set: {
      emails: [
        user.emails[0]
      ]
    }
  });

  const updatedAccount = Accounts.findOne({ userId });
  Promise.await(appEvents.emit("afterAccountUpdate", {
    updatedAccount,
    updatedBy: userId,
    updatedFields: ["emails"]
  }));

  return true;
}

/**
 * @name accounts/removeEmailAddress
 * @memberof Accounts/Methods
 * @method
 * @summary Remove a user's email address.
 * @param {String} email - user email.
 * @returns {Boolean} - returns boolean.
 */
export default function removeEmailAddress(email) {
  check(email, String);

  const user = Meteor.user();

  // Remove email address from user
  MeteorAccounts.removeEmail(user._id, email);

  // Verify new address
  sendVerificationEmail({
    bodyTemplate: "accounts/verifyUpdatedEmail",
    subjectTemplate: "accounts/verifyUpdatedEmail/subject",
    userId: user._id
  });

  // Sync users and accounts collections
  syncUsersAndAccounts();

  return true;
}

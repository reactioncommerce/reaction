import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @name accounts/verifyAccount
 * @memberof Accounts/Methods
 * @method
 * @summary Verifies the email address in account document (if user verification in users collection was successful already)
 * @example Meteor.call("accounts/verifyAccount")
 * @returns {Boolean} - returns true on success
 */
export default function verifyAccount() {
  if (!this.userId) {
    // not logged in
    return null;
  }

  const user = Meteor.user();
  const addresses = user.emails
    .filter((email) => email.verified)
    .map((email) => email.address);
  const result = Accounts.update({
    "userId": this.userId,
    "emails.address": { $in: addresses }
  }, {
    $set: {
      "emails.$.verified": true
    }
  });

  if (result) {
    const updatedAccount = Accounts.findOne({ userId: this.userId });
    Promise.await(appEvents.emit("afterAccountUpdate", {
      updatedAccount,
      updatedBy: this.userId,
      updatedFields: ["emails"]
    }));
  }

  return result;
}

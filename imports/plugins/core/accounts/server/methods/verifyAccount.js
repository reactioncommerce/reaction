import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";

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
    return undefined;
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
    Hooks.Events.run(
      "afterAccountsUpdate",
      this.userId, {
        accountId: Accounts.findOne({ userId: this.userId })._id,
        updatedFields: ["emails"]
      }
    );
  }

  return result;
}

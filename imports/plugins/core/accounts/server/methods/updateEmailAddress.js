import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import appEvents from "/imports/node-app/core/util/appEvents";

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
  const userId = Reaction.getUserId();
  const shopId = Reaction.getShopId();

  // Add email to user account
  MeteorAccounts.addEmail(userId, email);

  appEvents.emit("afterAddUnverifiedEmailToUser", { email, shopId, userId });

  return true;
}

import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Reaction, Logger } from "/server/api";

/**
 * @name accounts/sendResetPasswordEmail
 * @memberof Methods/Accounts
 * @method
 * @example Meteor.call("accounts/sendResetPasswordEmail", options)
 * @summary Send reset password email
 * @param {Object} options
 * @param {String} options.email - email of user
 * @returns {false}
 */
Meteor.methods({
  "accounts/sendResetPasswordEmail"(options) {
    check(options, {
      email: String
    });

    const user = Accounts.findUserByEmail(options.email);

    if (!user) {
      Logger.error("accounts/sendResetPasswordEmail - User not found");
      throw new Meteor.Error("not-found", "User not found");
    }

    const emails = _.map(user.emails || [], "address");

    const caseInsensitiveEmail = _.find(emails, (email) => email.toLowerCase() === options.email.toLowerCase());

    Reaction.Accounts.sendResetPasswordEmail(user._id, caseInsensitiveEmail);
  }
});

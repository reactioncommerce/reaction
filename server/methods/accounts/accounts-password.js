import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Reaction, Logger } from "/server/api";

Meteor.methods({

  "accounts/sendResetPasswordEmail"(options) {
    check(options, {
      email: String
    });

    const user = Accounts.findUserByEmail(options.email);

    if (!user) {
      Logger.error("accounts/sendResetPasswordEmail - User not found");
      throw new Meteor.Error("user-not-found", "User not found");
    }

    const emails = _.map(user.emails || [], "address");

    const caseInsensitiveEmail = _.find(emails, (email) => {
      return email.toLowerCase() === options.email.toLowerCase();
    });

    Reaction.Accounts.sendResetPasswordEmail(user._id, caseInsensitiveEmail);
  }
});

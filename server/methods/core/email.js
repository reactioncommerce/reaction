import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Jobs, Packages } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

Meteor.methods({

  /**
   * Verify the current email configuration
   * @return {Boolean} - returns true if SMTP connection succeeds
   */
  "email/verifySettings"() {
    if (!Roles.userIsInRole(this.userId, ["owner", "admin", "dashboard"])) {
      Logger.error("email/verifySettings: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const { Email } = Reaction;

    try {
      return Meteor.wrapAsync(Email.verifyConfig)(Email.getMailConfig());
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error(e.responseCode, e.response);
    }
  },


  /**
   * Save new email configuration
   * @param {Object} settings - mail provider settings
   * @return {Boolean} - returns true if update succeeds
   */
  "email/saveSettings"(settings) {
    if (!Roles.userIsInRole(this.userId, ["owner", "admin", "dashboard"])) {
      Logger.error("email/saveSettings: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    check(settings, {
      service: String,
      host: Match.Optional(String),
      port: Match.Optional(Match.OneOf(String, Number)),
      user: String,
      password: String
    });

    Packages.update({ name: "core", shopId: Reaction.getShopId() }, {
      $set: {
        "settings.mail": settings
      }
    });

    return true;
  },


  /**
   * Retry a failed or cancelled email job
   * @param {String} jobId - a sendEmail job ID
   * @return {Boolean} - returns true if job is successfully restarted
   */
  "emails/retryFailed"(jobId) {
    if (!Roles.userIsInRole(this.userId, ["owner", "admin", "dashboard"])) {
      Logger.error("email/retryFailed: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    check(jobId, String);

    Jobs.restartJobs([jobId]);

    return true;
  }
});

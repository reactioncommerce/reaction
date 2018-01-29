import getServiceConfig from "nodemailer-wellknown";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Jobs, Packages } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

/**
 * @file Methods for sending emails, retrying failed emails and verifying email configuration.
 * Run these methods using `Meteor.call()`
 *
 * @example Meteor.call("emails/retryFailed", email._id, (err)
 * @namespace Methods/Email
*/
Meteor.methods({
  /**
   * @name email/verifySettings
   * @method
   * @summary Verify the current email configuration
   * @memberof Methods/Email
   * @param {Object} settings - optional settings object (otherwise uses settings in database)
   * @return {Boolean} - returns true if SMTP connection succeeds
   */
  "email/verifySettings"(settings) {
    if (!Reaction.hasPermission(["owner", "admin", "dashboard"], this.userId)) {
      Logger.error("email/verifySettings: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    check(settings, Match.Optional(Object));

    let config;

    // if a settings object has been provided, build a config
    if (typeof settings === "object") {
      const { service, host, port, user, password } = settings;

      if (service === "custom" && host && port) {
        // create a custom Nodemailer config
        config = { host, port };

        if (host === "localhost") {
          config.ignoreTLS = true;
        }
      } else if (service) {
        // create a Nodemailer config from the nodemailer-wellknown services
        config = getServiceConfig(service) || {};
      }

      if (user && password) {
        config.auth = { user, pass: password };
      }
    }

    const { Email } = Reaction;

    const conf = config || Email.getMailConfig();

    Logger.debug(conf, "Verifying email config settings");

    try {
      return Meteor.wrapAsync(Email.verifyConfig)(conf);
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error(e.responseCode, e.response);
    }
  },

  /**
   * @name email/saveSettings
   * @method
   * @summary Save new email configuration
   * @memberof Methods/Email
   * @param {Object} settings - mail provider settings
   * @return {Boolean} - returns true if update succeeds
   */
  "email/saveSettings"(settings) {
    if (!Reaction.hasPermission(["owner", "admin", "dashboard"], this.userId)) {
      Logger.error("email/saveSettings: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    check(settings, {
      service: String,
      host: Match.Optional(String),
      port: Match.Optional(Number),
      user: Match.Optional(String),
      password: Match.Optional(String)
    });

    Packages.update({ name: "core", shopId: Reaction.getShopId() }, {
      $set: {
        "settings.mail": settings
      }
    });

    delete settings.password;

    Logger.info(settings, "Email settings updated");

    return true;
  },

  /**
   * @name email/retryFailed
   * @method
   * @summary Retry a failed or cancelled email job
   * @memberof Methods/Email
   * @param {String} jobId - a sendEmail job ID
   * @return {Boolean} - returns true if job is successfully restarted
   */
  "emails/retryFailed"(jobId) {
    if (!Reaction.hasPermission(["owner", "admin", "reaction-email"], this.userId)) {
      Logger.error("email/retryFailed: Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    check(jobId, String);
    let emailJobId = jobId;

    Logger.debug(`emails/retryFailed - restarting email job "${jobId}"`);

    // Get email job to retry
    const job = Jobs.getJob(jobId);
    // If this job was never completed, restart it and set it to "ready"
    if (job._doc.status !== "completed") {
      job.restart();
      job.ready();
    } else {
      // Otherwise rerun the completed job
      // `rerun` clones the job and returns the id.
      // We'll set the new one to ready
      emailJobId = job.rerun(); // Clone job to rerun
    }

    // Set the job status to ready to trigger the Jobs observer to trigger sendEmail
    Jobs.update({ _id: emailJobId }, {
      $set: {
        status: "ready"
      }
    });

    return true;
  }
});

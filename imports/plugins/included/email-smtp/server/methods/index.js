import saveSettings from "./saveSettings";

/**
 * @file Methods for sending emails, retrying failed emails and verifying email configuration.
 * Run these methods using `Meteor.call()`
 *
 * @example Meteor.call("emails/retryFailed", email._id, (err)
 * @namespace Email/Methods
*/

export default {
  "email/saveSettings": saveSettings
};

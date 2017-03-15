import { i18next } from "/client/api";

export default {
  /**
   * Restart a failed or cancelled email job
   * @param {Object} email - the email job object
   * @return {null} triggers an alert
   */
  resend(email) {
    Meteor.call("emails/retryFailed", email._id, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("app.error", { error: err.reason }), "error");
      }
      return Alerts.toast(i18next.t("mail.alerts.resendSuccess", { email: email.data.to }), "success");
    });
  }
};

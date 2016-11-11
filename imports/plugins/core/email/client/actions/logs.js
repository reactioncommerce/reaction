import { Router, i18next } from "/client/api";

export default {

  /**
   * Update the limit query param in the URL
   * @param {Object} event - sythetic React event
   * @return {String} returns the updated limit
   */
  updateLimit(event) {
    return _.debounce(() => {
      const limit = event.target.value;
      if (!limit) {
        Router.setQueryParams({ limit: null });
      } else {
        Router.setQueryParams({ limit });
      }
    }, 300, { maxWait: 1000 })();
  },


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

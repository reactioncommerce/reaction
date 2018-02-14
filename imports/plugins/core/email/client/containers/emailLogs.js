import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import EmailLogs from "../components/emailLogs";
import { Jobs } from "/lib/collections";

const composer = (props, onData) => {
  if (Meteor.subscribe("Emails").ready()) {
    const emails = Jobs.find().fetch();
    onData(null, { emails });
  }
};

const handlers = {
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

registerComponent("EmailLogs", EmailLogs, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(EmailLogs);

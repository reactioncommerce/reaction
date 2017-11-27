import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Accounts } from "/lib/collections";
import UpdateEmail from "../components/updateEmail";

const handlers = {
  handleUpdateEmail({ newEmail, oldEmail }, callback) {
    Meteor.call("accounts/validation/email", newEmail, false, (result, error) => {
      if (error.error) {
        Alerts.toast(i18next.t("accountsUI.error.invalidEmail", { err: error.reason }), "error");
        return callback();
      }

      Meteor.call("accounts/updateEmailAddress", newEmail, (err) => {
        if (err) {
          Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: err.message }), "error");
          return callback();
        }

        // Email changed, remove original email
        Meteor.call("accounts/removeEmailAddress", oldEmail, () => {
          Alerts.toast(i18next.t("accountsUI.info.emailUpdated"), "success");
          return callback();
        });
      });
    });
  }
};

const composer = (props, onData) => {
  const user = Accounts.findOne(Meteor.userId());
  const email = user.emails.length > 0 ? user.emails[0].address : "";
  onData(null, { email });
};

registerComponent("UpdateEmail", UpdateEmail, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(UpdateEmail);

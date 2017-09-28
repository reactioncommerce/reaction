import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next, Reaction } from "/client/api";
import { Accounts } from "/lib/collections";
import UpdateEmail from "../components/updateEmail";

const handlers = {
  handleUpdateEmail({ newEmail, oldEmail, targetUserId }, callback) {
    Meteor.call("accounts/validation/email", newEmail, false, (result, error) => {
      if (error.error) {
        Alerts.toast(i18next.t("accountsUI.error.invalidEmail", { err: error.reason }), "error");
        return callback();
      }

      const updateInfo = { newEmail, targetUserId };
      Meteor.call("accounts/updateEmailAddress", updateInfo, (err) => {
        if (err) {
          Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: err.message }), "error");
          return callback();
        }

        // Email changed, remove original email
        const oldEmailInfo = { oldEmail, targetUserId };
        Meteor.call("accounts/removeEmailAddress", oldEmailInfo, () => {
          Alerts.toast(i18next.t("accountsUI.info.emailUpdated"), "success");
          return callback();
        });
      });
    });
  }
};

const composer = (props, onData) => {
  const targetUserId = Reaction.Router.getQueryParam("userId") || Meteor.userId();
  const user = Accounts.findOne(targetUserId);
  const email = user.emails[0].address;
  onData(null, { email, targetUserId });
};

registerComponent("UpdateEmail", UpdateEmail, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(UpdateEmail);

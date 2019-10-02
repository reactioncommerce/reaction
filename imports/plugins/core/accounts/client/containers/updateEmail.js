import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next, Reaction } from "/client/api";
import { Accounts } from "/lib/collections";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import UpdateEmail from "../components/updateEmail";

const handlers = {
  handleUpdateEmail({ accountId, newEmail, mutation, oldEmail }, callback) {
    Meteor.call("accounts/validation/email", newEmail, false, (result, error) => {
      if (error.error) {
        Alerts.toast(i18next.t("accountsUI.error.invalidEmail", { err: error.reason }), "error");
        return callback();
      }

      Meteor.call("accounts/updateEmailAddress", newEmail, async (err) => {
        if (err) {
          Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: err.message }), "error");
          return callback();
        }

        const { data, error: mutationError } = await mutation({
          variables: {
            input: {
              accountId,
              email: oldEmail
            }
          }
        });

        if (data) {
          Alerts.toast(i18next.t("accountsUI.info.emailUpdated"), "success");
        }

        if (mutationError) {
          Alerts.toast(i18next.t("accountsUI.error.emailAlreadyExists", { err: mutationError.message }), "error");
        }

        return callback();
      });

      return null;
    });
  }
};

const composer = async (props, onData) => {
  const account = Accounts.findOne(Reaction.getUserId());
  const [opaqueAccountId] = await getOpaqueIds([{ namespace: "Account", id: account._id }]);
  const email = account.emails.length > 0 ? account.emails[0].address : "";
  onData(null, { accountId: opaqueAccountId, email });
};

registerComponent("UpdateEmail", UpdateEmail, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(UpdateEmail);

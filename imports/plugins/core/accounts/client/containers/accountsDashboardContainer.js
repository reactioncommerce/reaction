import { compose, withProps } from "recompose";
import Alert from "sweetalert2";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts, Groups } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import AccountsDashboard from "../components/accountsDashboard";

const handlers = {
  handleUserGroupChange({ account, ownerGrpId, onMethodLoad, onMethodDone }) {
    return (event, groupId) => {
      if (onMethodLoad) { onMethodLoad(); }

      if (groupId === ownerGrpId) {
        alertConfirm(groupId)
          .then(() => {
            return updateMethodCall(groupId);
          })
          .catch(() => false);
      }

      return updateMethodCall(groupId);
    };

    function updateMethodCall(groupId) {
      Meteor.call("group/addUser", account._id, groupId, (err) => {
        if (onMethodDone) { onMethodDone(); }
        if (err) {
          return Alerts.toast(i18next.t("admin.groups.addUserError", { err: err.message }), "error");
        }
        return Alerts.toast(i18next.t("admin.groups.addUserSuccess"), "success");
      });
    }

    function alertConfirm() {
      const popUpOpt = {
        title: i18next.t("admin.settings.changeOwner"),
        text: i18next.t("admin.settings.changeOwnerWarn"),
        type: "warning",
        showCancelButton: true,
        cancelButtonText: i18next.t("app.cancel"),
        confirmButtonText: i18next.t("admin.settings.continue")
      };

      return Alert(popUpOpt);
    }
  },

  handleRemoveUserFromGroup(account, groupId) {
    return () => {
      Meteor.call("group/removeUser", account._id, groupId, (err) => {
        if (err) {
          return Alerts.toast(i18next.t("admin.groups.removeUserError", { err: err.message }), "error");
        }
        return Alerts.toast(i18next.t("admin.groups.removeUserSuccess"), "success");
      });
    };
  }
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const adminUserSub = Meteor.subscribe("Accounts", null);
  const grpSub = Meteor.subscribe("Groups");

  if (adminUserSub.ready() && grpSub.ready()) {
    const groups = Groups.find({
      slug: { $nin: ["customer", "guest"] },
      shopId: Reaction.getShopId()
    }).fetch();
    const adminQuery = {
      [`roles.${Reaction.getShopId()}`]: {
        $in: ["dashboard"]
      }
    };

    const adminUsers = Meteor.users.find(adminQuery, { fields: { _id: 1 } }).fetch();
    const ids = adminUsers.map((user) => user._id);
    const accounts = Accounts.find({ _id: { $in: ids }, shopId }).fetch();

    onData(null, { accounts, groups });
  }
};

registerComponent("AccountsDashboard", AccountsDashboard, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(AccountsDashboard);

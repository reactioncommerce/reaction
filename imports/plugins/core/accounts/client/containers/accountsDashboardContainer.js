import { compose, withProps } from "recompose";
import Alert from "sweetalert2";
import { registerComponent, composeWithTracker, withIsAdmin } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts, Groups } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import AccountsDashboard from "../components/accountsDashboard";

const handlers = {
  handleUserGroupChange({ account, ownerGrpId, onMethodLoad, onMethodDone }) {
    return (event, groupId) => {
      if (onMethodLoad) { onMethodLoad(); }

      if (groupId === ownerGrpId) {
        return alertConfirm()
          .then(({ value }) => {
            if (value) {
              return updateMethodCall(groupId);
            }
          })
          .finally(() => {
            if (onMethodDone) { onMethodDone(); }
          });
      }

      return updateMethodCall(groupId);
    };

    function updateMethodCall(groupId) {
      Meteor.call("group/addUser", account._id, groupId, (err) => {
        if (err) {
          Alerts.toast(i18next.t("admin.groups.addUserError", { err: err.message }), "error");
        }
        if (!err) {
          Alerts.toast(i18next.t("admin.groups.addUserSuccess"), "success");
        }
        if (onMethodDone) { onMethodDone(); }
      });
    }

    function alertConfirm() {
      let changeOwnerWarn = "changeShopOwnerWarn";
      if (Reaction.getShopId() === Reaction.getPrimaryShopId()) {
        changeOwnerWarn = "changeMktOwnerWarn";
      }
      return Alert({
        title: i18next.t("admin.settings.changeOwner"),
        text: i18next.t(`admin.settings.${changeOwnerWarn}`),
        type: "warning",
        showCancelButton: true,
        cancelButtonText: i18next.t("admin.settings.cancel"),
        confirmButtonText: i18next.t("admin.settings.continue")
      });
    }
  },

  handleRemoveUserFromGroup(account, groupId) {
    return () => {
      alertConfirm()
        .then(({ value }) => {
          if (value) {
            return removeMethodCall();
          }
          return false;
        })
        .catch(() => false);

      function removeMethodCall() {
        Meteor.call("group/removeUser", account._id, groupId, (err) => {
          if (err) {
            return Alerts.toast(i18next.t("admin.groups.removeUserError", { err: err.message }), "error");
          }
          return Alerts.toast(i18next.t("admin.groups.removeUserSuccess"), "success");
        });
      }
    };

    function alertConfirm() {
      return Alert({
        title: i18next.t("admin.settings.removeUser"),
        text: i18next.t("admin.settings.removeUserWarn"),
        type: "warning",
        showCancelButton: true,
        cancelButtonText: i18next.t("admin.settings.cancel"),
        confirmButtonText: i18next.t("admin.settings.continue")
      });
    }
  }
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const adminUserSub = Meteor.subscribe("Accounts", null);
  const grpSub = Meteor.subscribe("Groups", { shopId });

  if (adminUserSub.ready() && grpSub.ready()) {
    const groups = Groups.find({
      shopId: Reaction.getShopId()
    }).fetch();

    const adminQuery = {
      [`roles.${shopId}`]: {
        $in: ["dashboard"]
      }
    };

    const adminUsers = Meteor.users.find(adminQuery, { fields: { _id: 1 } }).fetch();
    const ids = adminUsers.map((user) => user._id);
    const accounts = Accounts.find({ _id: { $in: ids } }).fetch();
    const adminGroups = groups.reduce((admGrps, group) => {
      if (group.slug !== "customer" && group.slug !== "guest") {
        admGrps.push(group);
      }
      return admGrps;
    }, []);

    onData(null, { accounts, groups, adminGroups });
  }
};

registerComponent("AccountsDashboard", AccountsDashboard, [
  withIsAdmin,
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  withIsAdmin,
  composeWithTracker(composer),
  withProps(handlers)
)(AccountsDashboard);

import { compose, withProps } from "recompose";
import Alert from "sweetalert2";
import { registerComponent, composeWithTracker, withIsAdmin } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import { Accounts, Groups } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import AccountsDashboard from "../components/accountsDashboard";
import addAccountToGroupMutation from "./addAccountToGroup.graphql";
import removeAccountFromGroupMutation from "./removeAccountFromGroup.graphql";

const addAccountToGroupMutate = simpleGraphQLClient.createMutationFunction(addAccountToGroupMutation);
const removeAccountFromGroupMutate = simpleGraphQLClient.createMutationFunction(removeAccountFromGroupMutation);

/**
 * @summary Show confirmation alert to verify the user wants to remove the user from the group
 * @return {Object} Object with `value` prop that is truthy if they want to continue
 */
function alertConfirmRemoveUser() {
  return Alert({
    title: i18next.t("admin.settings.removeUser"),
    text: i18next.t("admin.settings.removeUserWarn"),
    type: "warning",
    showCancelButton: true,
    cancelButtonText: i18next.t("admin.settings.cancel"),
    confirmButtonText: i18next.t("admin.settings.continue")
  });
}

/**
 * @summary Show confirmation alert to verify the user wants to change the shop owner
 * @return {Object} Object with `value` prop that is truthy if they want to continue
 */
function alertConfirmChangeOwner() {
  return Alert({
    title: i18next.t("admin.settings.changeOwner"),
    text: i18next.t("admin.settings.changeShopOwnerWarn"),
    type: "warning",
    showCancelButton: true,
    cancelButtonText: i18next.t("admin.settings.cancel"),
    confirmButtonText: i18next.t("admin.settings.continue")
  });
}

const handlers = {
  handleUserGroupChange({ account, currentGroupId, ownerGrpId, onMethodLoad, onMethodDone }) {
    return async (event, groupId) => {
      if (onMethodLoad) onMethodLoad();

      // Confirm if removing owner role from myself
      if (currentGroupId === ownerGrpId) {
        const loggedInAccount = Accounts.findOne({ userId: Meteor.userId() });
        if (loggedInAccount && loggedInAccount._id === account._id) {
          const { value } = await alertConfirmChangeOwner();
          if (!value) {
            if (onMethodDone) onMethodDone();
            return null;
          }
        }
      }

      try {
        const [
          opaqueAccountId,
          opaqueGroupId
        ] = await getOpaqueIds([
          { namespace: "Account", id: account._id },
          { namespace: "Group", id: groupId }
        ]);

        await addAccountToGroupMutate({ accountId: opaqueAccountId, groupId: opaqueGroupId });
      } catch (error) {
        Alerts.toast(i18next.t("admin.groups.addUserError", { err: error.message }), "error");
      }

      if (onMethodDone) onMethodDone();
      return null;
    };
  },

  handleRemoveUserFromGroup(account, groupId) {
    return async () => {
      const { value } = await alertConfirmRemoveUser();
      if (!value) return null;

      try {
        const [
          opaqueAccountId,
          opaqueGroupId
        ] = await getOpaqueIds([
          { namespace: "Account", id: account._id },
          { namespace: "Group", id: groupId }
        ]);

        await removeAccountFromGroupMutate({ accountId: opaqueAccountId, groupId: opaqueGroupId });
      } catch (error) {
        Alerts.toast(i18next.t("admin.groups.removeUserError", { err: error.message }), "error");
      }

      return null;
    };
  }
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const grpSub = Meteor.subscribe("Groups", { shopId });

  if (Reaction.Subscriptions.Account.ready() && grpSub.ready()) {
    const groups = Groups.find({ shopId }).fetch();
    const adminGroups = groups.filter((group) => group.slug !== "customer" && group.slug !== "guest");

    // Find all accounts that are in any of the admin groups
    const adminGroupIds = adminGroups.map((group) => group._id);
    const accounts = Accounts.find({ groups: { $in: adminGroupIds } }).fetch();

    onData(null, { accounts, adminGroups, groups });
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

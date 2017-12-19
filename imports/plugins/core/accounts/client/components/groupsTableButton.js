import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent, withPermissions } from "@reactioncommerce/reaction-components";

/**
 * @summary React stateless component for "remove from group" button for groupTable
 * @memberof Accounts
 * @example <Components.GroupsTableButton {...{ account, group, handleRemoveUserFromGroup }} />
 * @param {Object} props - React PropTypes
 * @property {Object} account - User account object
 * @property {Object} group - Group data
 * @property {Function} handleRemoveUserFromGroup - function to call on button click
 * @property {Boolean} hasPermissions - true or false depending on if user is granted access
 * @return {Node} React node containing wrapped button
 */
const GroupsTableButton = ({ account, group, handleRemoveUserFromGroup, hasPermissions }) => {
  if (group.slug === "owner") {
    return null;
  }

  if (!hasPermissions) {
    return null;
  }

  return (
    <div className="group-table-button">
      <Components.Button
        status="danger"
        onClick={handleRemoveUserFromGroup(account, group._id)}
        bezelStyle="solid"
        i18nKeyLabel="admin.groups.remove"
        label="Remove"
      />
    </div>
  );
};

GroupsTableButton.propTypes = {
  account: PropTypes.object,
  group: PropTypes.object, // current group in interation
  handleRemoveUserFromGroup: PropTypes.func,
  hasPermissions: PropTypes.bool
};

registerComponent("GroupsTableButton", GroupsTableButton, withPermissions({ roles: ["accounts"] }));

export default GroupsTableButton;

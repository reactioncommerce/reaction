import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @summary React stateless component for "remove from group" button for groupTable
 * @memberof Accounts
 * @example <Components.GroupsTableButton {...{ account, group, handleRemoveUserFromGroup }} />
 * @param {Object} props - React PropTypes
 * @property {Object} account - User account object
 * @property {Object} group - Group data
 * @property {Function} handleRemoveUserFromGroup - function to call on button click
 * @returns {Node} React node containing wrapped button
 */
const GroupsTableButton = ({ account, group, handleRemoveUserFromGroup }) => (
  <div className="group-table-button">
    <Components.Button
      bezelStyle="solid"
      i18nKeyLabel="admin.groups.remove"
      label="Remove"
      onClick={handleRemoveUserFromGroup(account, group._id)}
      status="danger"
    />
  </div>
);

GroupsTableButton.propTypes = {
  account: PropTypes.object,
  group: PropTypes.object, // current group in interaction
  handleRemoveUserFromGroup: PropTypes.func
};

registerComponent("GroupsTableButton", GroupsTableButton);

export default GroupsTableButton;

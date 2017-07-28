import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { getGravatar } from "../helpers/accountsHelper";

const GroupsTableCell = ({ account, columnName, group, groups, handleRemoveUserFromGroup, handleUserGroupChange }) => {
  if (columnName === "name") {
    return (
      <div className="table-cell body-first">
        <img className="accounts-img-tag" src={getGravatar(account)} />
        <span><b>{account.name}</b></span>
      </div>
    );
  }

  if (columnName === "email") {
    return (
      <div className="table-cell body">
        <span>{_.get(account, "emails[0].address")}</span>
      </div>
    );
  }

  if (columnName === "createdAt") {
    return (
      <div className="table-cell body">
        <span>
          {account.createdAt && account.createdAt.toDateString()}
        </span>
      </div>
    );
  }

  if (columnName === "dropdown") {
    const dropDownButton = (
      <div className="group-dropdown">
        <Components.Button label={group.name && _.startCase(group.name)}>
          &nbsp;<i className="fa fa-chevron-down" />
        </Components.Button>
      </div>
    );

    return (
      <Components.DropDownMenu
        buttonElement={dropDownButton}
        attachment="bottom center"
        onChange={handleUserGroupChange(account)}
      >
        {groups
          .filter((grp) => grp._id !== group._id)
          .map((grp, index) => (
            <Components.MenuItem
              key={index}
              label={_.startCase(grp.name)}
              selectLabel={_.startCase(grp.name)}
              value={grp._id}
            />
          ))}
      </Components.DropDownMenu>
    );
  }

  if (columnName === "button") {
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
  }

  return null;
};

GroupsTableCell.propTypes = {
  account: PropTypes.object,
  columnName: PropTypes.string,
  group: PropTypes.object, // current group in interation
  groups: PropTypes.array, // all available groups
  handleRemoveUserFromGroup: PropTypes.func,
  handleUserGroupChange: PropTypes.func
};

registerComponent("GroupsTableCell", GroupsTableCell);

export default GroupsTableCell;

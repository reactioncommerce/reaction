import { Meteor } from "meteor/meteor";
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { getUserAvatar } from "/imports/plugins/core/accounts/client/helpers/helpers";

const GroupsTableCell = (props) => {
  const {
    account,
    columnName,
    group,
    adminGroups,
    handleRemoveUserFromGroup,
    handleUserGroupChange,
    moment
  } = props;

  const email = _.get(account, "emails[0].address");
  const groups = adminGroups;
  const userAvatar = getUserAvatar(account);
  const createdAt = (moment && moment(account.createdAt).format("MMM Do")) || account.createdAt.toLocaleString();

  if (columnName === "name") {
    // use first part of email, if account has no name
    const name = account.name || email.split("@")[0];
    return (
      <div className="table-cell body-first">
        {userAvatar}
        <span><b>{name}</b></span>
      </div>
    );
  }

  if (columnName === "email") {
    return (
      <div className="table-cell body">
        <span>{email}</span>
      </div>
    );
  }

  if (columnName === "createdAt") {
    return (
      <div className="table-cell body created-at">
        <span>
          {createdAt}
        </span>
      </div>
    );
  }

  if (columnName === "dropdown") {
    const groupName = <span className="group-dropdown">{_.startCase(groups[0].name)}</span>;
    const ownerGroup = groups.find((grp) => grp.slug === "owner") || {};
    const hasOwnerAccess = Reaction.hasPermission("owner", Meteor.userId(), Reaction.getShopId());

    if (groups.length === 1) {
      return groupName;
    }

    if (group.slug === "owner") {
      return groupName;
    }

    const { onMethodDone, onMethodLoad } = props;
    const dropDownButton = (opt) => ( // eslint-disable-line
      <div className="group-dropdown">
        <Components.Button bezelStyle="solid" label={group.name && _.startCase(group.name)}>
          &nbsp;
          {opt && opt.length > 1 && // add icon only if there's more than the current group
            <i className="fa fa-chevron-down" />
          }
        </Components.Button>
      </div>
    );

    // Permission check. Remove owner option, if user is not current owner.
    // Also remove groups user does not have roles to manage. This is also checked on the server
    const dropOptions = groups
      .filter((grp) => !((grp.slug === "owner" && !hasOwnerAccess)))
      .filter((grp) => Reaction.canInviteToGroup({ group: grp })) || [];

    if (dropOptions.length < 2) { return dropDownButton(); } // do not use dropdown if only one option

    return (
      <div className="group-dropdown">
        <Components.DropDownMenu
          buttonElement={dropDownButton(groups)}
          attachment="bottom right"
          targetAttachment="top right"
          onChange={handleUserGroupChange({ account, ownerGrpId: ownerGroup._id, onMethodDone, onMethodLoad })}
        >
          {dropOptions
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
      </div>
    );
  }

  if (columnName === "button") {
    return <Components.GroupsTableButton {...{ account, group, handleRemoveUserFromGroup }} />;
  }

  return null;
};

GroupsTableCell.propTypes = {
  account: PropTypes.object,
  adminGroups: PropTypes.array, // all admin groups
  columnName: PropTypes.string,
  group: PropTypes.object, // current group in interation
  handleRemoveUserFromGroup: PropTypes.func,
  handleUserGroupChange: PropTypes.func,
  moment: PropTypes.func,
  onMethodDone: PropTypes.func,
  onMethodLoad: PropTypes.func
};

registerComponent("GroupsTableCell", GroupsTableCell, withMoment);

export default withMoment(GroupsTableCell);

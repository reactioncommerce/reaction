import React from "react";
import PropTypes from "prop-types";
import { Checkbox, Icon, Translation } from "@reactioncommerce/reaction-ui";

const GroupHeader = ({ columnName }) => {
  if (columnName === "name") {
    return (
      <div className="group-header-name">
        <span className="name-cell"><Checkbox /></span>
        <Translation className="name-cell" defaultValue="Name" i18nKey="admin.groups.name" />
        <span className="name-icon-cell">
          <Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  if (columnName === "email") {
    return (
      <div className="group-header-email">
        <Translation className="content-cell" defaultValue="Email" i18nKey="admin.groups.email" />
        <span className="icon-cell">
          <Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  if (columnName === "createdAt") {
    return (
      <div className="group-header-createdAt">
        <Translation className="content-cell" defaultValue="Last Active" i18nKey="admin.groups.lastActive" />
        <span className="icon-cell">
          <Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  return null;
};

GroupHeader.propTypes = {
  columnName: PropTypes.string
};

export default GroupHeader;

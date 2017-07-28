import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const GroupHeader = ({ columnName }) => {
  if (columnName === "name") {
    return (
      <div className="group-header-name">
        <span className="name-cell"><Components.Checkbox /></span>
        <Components.Translation className="name-cell" defaultValue="Name" i18nKey="admin.groups.name" />
        <span className="name-icon-cell">
          <Components.Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  if (columnName === "email") {
    return (
      <div className="group-header-email">
        <Components.Translation className="content-cell" defaultValue="Email" i18nKey="admin.groups.email" />
        <span className="icon-cell">
          <Components.Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  if (columnName === "createdAt") {
    return (
      <div className="group-header-createdAt">
        <Components.Translation className="content-cell" defaultValue="Last Active" i18nKey="admin.groups.lastActive" />
        <span className="icon-cell">
          <Components.Icon icon="chevron-down" />
        </span>
      </div>
    );
  }
  return null;
};

GroupHeader.propTypes = {
  columnName: PropTypes.string
};

registerComponent("GroupHeader", GroupHeader);

export default GroupHeader;

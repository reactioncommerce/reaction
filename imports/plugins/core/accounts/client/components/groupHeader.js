import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const GroupHeader = ({ columnName }) => {
  const showSortItems = false; // to be used to show sort icons. When filters fields are available, we'll show icons

  if (columnName === "name") {
    return (
      <div className="group-header-name">
        {showSortItems && <span className="name-cell"><Components.Checkbox /></span>}
        <Components.Translation className="name-cell" defaultValue="Name" i18nKey="admin.groups.name" />
        {showSortItems && <Components.Icon icon="chevron-down" />}
      </div>
    );
  }
  if (columnName === "email") {
    return (
      <div className="group-header-email">
        <Components.Translation className="content-cell" defaultValue="Email" i18nKey="admin.groups.email" />
        {showSortItems && <Components.Icon icon="chevron-down" />}
      </div>
    );
  }
  if (columnName === "createdAt") {
    return (
      <div className="group-header created-at">
        <Components.Translation className="content-cell" defaultValue="Last Active" i18nKey="admin.groups.lastActive" />
        {showSortItems && <Components.Icon icon="chevron-down" />}
      </div>
    );
  }
  return null;
};

GroupHeader.propTypes = {
  columnName: PropTypes.string,
  numberOfRows: PropTypes.number
};

registerComponent("GroupHeader", GroupHeader);

export default GroupHeader;

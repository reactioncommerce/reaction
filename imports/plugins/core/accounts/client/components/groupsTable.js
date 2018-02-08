import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";

const GroupsTable = (props) => {
  const { group } = props;
  const fields = ["name", "email", "createdAt", "dropdown", "button"];

  const tableClass = (length) => classnames({
    "accounts-group-table": true,
    "empty-table": !length
  });

  const columnMetadata = fields.map((columnName) => ({
    Header: <Components.GroupHeader columnName={columnName} numberOfRows={group.users && group.users.length} />,
    accessor: "",
    // TODO: Review this line - copied disable line from shippo carriers.js
    Cell: (data) => { // eslint-disable-line
      return <Components.GroupsTableCell account={data.value} columnName={columnName} {...props} />;
    }
  }));

  return (
    <Components.List>
      <Components.ListItem label={group.name} />
      <div className={tableClass(group.users.length)}>
        <SortableTable
          data={group.users}
          columnMetadata={columnMetadata}
          filteredFields={fields}
          filterType="none"
          showFilter={true}
          isSortable={false}
        />
      </div>
    </Components.List>
  );
};

GroupsTable.propTypes = {
  accounts: PropTypes.array,
  group: PropTypes.object,
  groups: PropTypes.array,
  onGroupSelect: PropTypes.func
};

registerComponent("GroupsTable", GroupsTable);

export default GroupsTable;

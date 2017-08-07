import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";


const GroupsTable = (props) => {
  const { group } = props;
  const isSortable = group.users && group.users.length > 1;
  const fields = {
    name: { width: 30 },
    email: { width: 30 },
    createdAt: { width: 10 },
    dropdown: { width: 20 },
    button: { width: 10 }
  };

  const tableClass = (length) => {
    return classnames({
      "accounts-group-table": true,
      "empty-table": !Boolean(length)
    });
  };

  const handleGroupClick = (grp) => {
    return () => {
      if (props.onGroupSelect) {
        props.onGroupSelect(grp);
      }
    };
  };

  const columnMetadata = Object.keys(fields).map((columnName) => ({
    Header: <Components.GroupHeader columnName={columnName} numberOfRows={group.users && group.users.length} />,
    accessor: "",
    // TODO: Review this line - copied disable line from shippo carriers.js
    Cell: (data) => { // eslint-disable-line
      return <Components.GroupsTableCell account={data.value} columnName={columnName} {...props} />;
    },
    width: `${fields[columnName].width}%`
  }));

  return (
    <Components.List>
      <Components.ListItem actionType="arrow" label={group.name} onClick={handleGroupClick(group)} />
      <div className={tableClass(group.users.length)}>
        <SortableTable
          data={group.users}
          columnMetadata={columnMetadata}
          filteredFields={Object.keys(fields)}
          filterType="none"
          showFilter={true}
          isSortable={isSortable}
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

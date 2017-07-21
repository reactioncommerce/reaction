import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { List, ListItem, SortableTable } from "@reactioncommerce/reaction-ui";
import GroupsTableCell from "./groupsTableCell";
import GroupHeader from "./groupHeader";

const fields = ["name", "email", "createdAt", "dropdown", "button"];

const GroupsTable = (props) => {
  const { group } = props;
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

  const columnMetadata = fields.map((columnName) => ({
    Header: <GroupHeader columnName={columnName} />,
    accessor: "",
    Cell: (data) => {
      return <GroupsTableCell account={data.value} columnName={columnName} {...props} />;
    }
  }));

  return (
    <List className="group-table">
      <ListItem actionType="arrow" label={group.name} onClick={handleGroupClick(group)} />
      <div className={tableClass(group.users.length)}>
        <SortableTable
          data={group.users}
          columnMetadata={columnMetadata}
          filteredFields={fields}
          filterType="none"
          showFilter={true}
        />
      </div>
    </List>
  );
};

GroupsTable.propTypes = {
  accounts: PropTypes.array,
  group: PropTypes.object,
  groups: PropTypes.array,
  onGroupSelect: PropTypes.func
};

export default GroupsTable;

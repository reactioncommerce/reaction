import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";

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
    Header: <Components.GroupHeader columnName={columnName} />,
    accessor: "",
    // TODO: Review this line - copied disable line from shippo carriers.js
    Cell: (data) => { // eslint-disable-line
      return <Components.GroupsTableCell account={data.value} columnName={columnName} {...props} />;
    }
  }));

  return (
    <Components.List className="group-table">
      <Components.ListItem actionType="arrow" label={group.name} onClick={handleGroupClick(group)} />
      <div className={tableClass(group.users.length)}>
        <SortableTable
          data={group.users}
          columnMetadata={columnMetadata}
          filteredFields={fields}
          filterType="none"
          showFilter={true}
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

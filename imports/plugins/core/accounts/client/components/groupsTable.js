import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { List, ListItem, SortableTable } from "@reactioncommerce/reaction-ui";
import GroupsTableCell from "./groupsTableCell";
import GroupHeader from "./groupHeader";

const fields = ["name", "email", "createdAt", "dropdown", "button"];

class GroupsTable extends Component {
  get group() {
    return this.props.group;
  }

  tableClass = (length) => {
    return classnames({
      "accounts-group-table": true,
      "empty-table": !Boolean(length)
    });
  };

  handleGroupClick = (grp) => {
    return () => {
      if (this.props.onGroupSelect) {
        this.props.onGroupSelect(grp);
      }
    };
  };

  get columnMetadata() {
    return fields.map((columnName) => ({
      Header: <GroupHeader columnName={columnName} />,
      accessor: "",
      Cell: (data) => {
        return <GroupsTableCell account={data.value} columnName={columnName} {...this.props} />;
      }
    }));
  }

  render() {
    return (
      <List className="group-table">
        <ListItem actionType="arrow" label={this.group.name} onClick={this.handleGroupClick(this.group)} />
        <div className={this.tableClass(this.group.users.length)}>
          <SortableTable
            data={this.group.users}
            columnMetadata={this.columnMetadata}
            filteredFields={fields}
            filterType="none"
            showFilter={true}
          />
        </div>
      </List>
    );
  }
}

GroupsTable.propTypes = {
  accounts: PropTypes.array,
  group: PropTypes.object,
  groups: PropTypes.array,
  onGroupSelect: PropTypes.func
};

export default GroupsTable;

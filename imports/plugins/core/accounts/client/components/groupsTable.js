import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";

const fields = ["name", "email", "createdAt", "dropdown", "button"];

class GroupsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  tableClass = (length) => {
    return classnames({
      "accounts-group-table": true,
      "empty-table": !Boolean(length)
    });
  };

  onLoading = () => {
    this.setState({ loading: true });
  };

  onDone = () => {
    this.setState({ loading: false });
  };

  handleGroupClick = (grp) => {
    return () => {
      if (this.props.onGroupSelect) {
        this.props.onGroupSelect(grp);
      }
    };
  };

  columnMetadata = fields.map((columnName) => ({
    Header: <Components.GroupHeader columnName={columnName} />,
    accessor: "",
    Cell: (data) => (
      <Components.GroupsTableCell
        account={data.value}
        columnName={columnName}
        onLoading={this.onLoading}
        onMethodDone={this.onMethodDone}
        {...this.props}
      />
    )
  }));

  render() {
    return (
      <Components.List className="group-table">
        {this.state.loading &&
          <Components.loading />
        }
        <Components.ListItem
          actionType="arrow"
          label={this.props.group.name}
          onClick={this.handleGroupClick(this.props.group)}
        />
        <div className={this.tableClass(this.props.group.users.length)}>
          <SortableTable
            data={this.props.group.users}
            columnMetadata={this.columnMetadata}
            filteredFields={fields}
            filterType="none"
            showFilter={true}
          />
        </div>
      </Components.List>
    );
  }
}

GroupsTable.propTypes = {
  accounts: PropTypes.array,
  group: PropTypes.object,
  groups: PropTypes.array,
  onGroupSelect: PropTypes.func
};

registerComponent("GroupsTable", GroupsTable);

export default GroupsTable;

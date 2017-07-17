import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Reaction } from "/client/api";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import { List, ListItem, SortableTable } from "/imports/plugins/core/ui/client/components";
import AccountsTableCell from "./accountsTableCell";

const fields = ["name", "email", "createdAt", "dropdown", "button"];

class AccountsTable extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array,
    i18nKeyLabel: PropTypes.string
  };

  renderTable(users) {
    const tableClass = length => {
      return classnames({
        "accounts-group-table": true,
        "empty-table": !Boolean(length)
      });
    };

    const columnMetadata = fields.map(columnName => ({
      Header: this.getHeader(columnName),
      accessor: "", // sends whole object
      headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
      Cell: data => {
        return <AccountsTableCell account={data.value} columnName={columnName} {...this.props} />;
      }
    }));

    return (
      <SortableTable
        tableClassName={tableClass(users.length)}
        data={users}
        columnMetadata={columnMetadata}
        filteredFields={fields}
        filterType="none"
        showFilter={true}
      />
    );
  }

  handleGroupClick(props) {
    return () => {
      Reaction.setActionViewDetail({
        label: "Permissions",
        i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
        data: props,
        template: "memberSettings"
      });
    };
  }

  getHeader(headerName) {
    if (headerName === "name") {
      return (
        <div>
          <span className="name-cell"><Checkbox /> </span>
          <span className="name-cell"> Name </span>
          <span className="name-icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "email") {
      return (
        <div>
          <span className="content-cell">Email</span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "createdAt") {
      return (
        <div>
          <span className="content-cell">Last Active</span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
  }

  render() {
    const { group, accounts, groups } = this.props;
    return (
      <List>
        <ListItem
          actionType="arrow"
          label={group.name}
          onClick={this.handleGroupClick({ group, groups, accounts })}
        />
        {this.renderTable(group.users)}
      </List>
    );
  }
}
export default AccountsTable;

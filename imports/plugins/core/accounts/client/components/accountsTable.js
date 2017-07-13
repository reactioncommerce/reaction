import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import { List, ListItem, SortableTable } from "/imports/plugins/core/ui/client/components";
import AccountsTableCell from "./accountsTableCell";

const fields = ["name", "email", "createdAt", "twoFactor", "dropdown", "button"];

class AccountsTable extends Component {
  static propTypes = {
    group: PropTypes.object,
    i18nKeyLabel: PropTypes.string
  };

  renderTable(users) {
    const columnMetadata = [];

    fields.forEach(columnName => {
      const columnMeta = {
        Header: this.getHeader(columnName),
        accessor: "", // sends whole object
        headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
        Cell: data => {
          return <AccountsTableCell account={data.value} columnName={columnName} {...this.props} />;
        }
      };
      columnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        tableClassName="accounts-group-table"
        data={users}
        columnMetadata={columnMetadata}
        filteredFields={fields}
        filterType="none"
        showFilter={true}
      />
    );
  }

  handleGroupClick() {
    Reaction.setActionViewDetail({
      label: "Permissions",
      i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
      template: "memberSettings"
    });
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
    if (headerName === "twoFactor") {
      return (
        <div>
          <span className="content-cell">Two Factor</span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
  }

  render() {
    return (
      <List>
        <ListItem actionType="arrow" label={this.props.group.name} onClick={this.handleGroupClick} />
        {this.renderTable(this.props.group.users)}
      </List>
    );
  }
}
export default AccountsTable;

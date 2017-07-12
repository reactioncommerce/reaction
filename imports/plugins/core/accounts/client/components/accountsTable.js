import React, { Component } from "react";
import PropTypes from "prop-types";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";
import AccountsTableRow from "./accountsTableRow";

// TODO: Move from here and set as constants
const filteredFields = {
  Name: "", Email: "emails[0].address", Updated: "createdAt", twoFactor: "", Dropdown: "", Button: ""
};
const allColumns = ["Name", "Email", "Updated", "Two Factor", "Dropdown", "Button"];
const columnNames = ["Name", "Email", "Updated", "Two Factor"];

class AccountsTable extends Component {
  static propTypes = {
    group: PropTypes.object,
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string
  };

  renderTable(users) {
    const columnMetadata = [];

    allColumns.forEach(columnName => {
      const columnMeta = {
        Header: columnNames.includes(columnName) ? this.getHeader(columnName) : "",
        accessor: filteredFields[columnName] || filteredFields.twoFactor,
        headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
        Cell: row => {
          return <AccountsTableRow row={row} columnName={columnName} {...this.props} />;
        }
      };
      columnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        tableClassName="-accounts"
        data={users}
        columnMetadata={columnMetadata}
        filteredFields={columnNames}
        filterType="none"
        showFilter={true}
      />
    );
  }
  getHeader(headerName) {
    if (headerName === "Name") {
      return (
        <div className="table-cell header">
          <span className="name-cell"><Checkbox /> </span>
          <span className="name-cell"> Name </span>
          <span className="name-icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "Email") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Email </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "Updated") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Last Active </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "Two Factor") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Two Factor </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
  }

  render() {
    return (
      <Card expanded={true}>
        <CardHeader
          actAsExpander={true}
          i18nKeyTitle={this.props.headerLabel}
          title={this.props.headerLabel}
          id="accounts"
        />
        <CardBody expandable={true} id="accounts">
          {this.renderTable(this.props.group.users)}
        </CardBody>
      </Card>
    );
  }
}
export default AccountsTable;

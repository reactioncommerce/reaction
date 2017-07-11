import React, { Component } from "react";
import PropTypes from "prop-types";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";
import AccountsTableRow from "./accountsTableRow";


class AccountsTable extends Component {
  static propTypes = {
    groups: PropTypes.object,
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string,
    users: PropTypes.array
  }

  renderTable(users) {
    const filteredFields = {
      Name: "",
      Email: "emails[0].address",
      Updated: "createdAt",
      twoFactor: "",
      Dropdown: "",
      Button: ""
    };
    const columnMetadata = [];
    const allColumns = ["Name", "Email", "Updated", "Two Factor", "Dropdown", "Button"];
    const columnNames = ["Name", "Email", "Updated", "Two Factor"];
    allColumns.forEach((columnName) => {
      const columnMeta = {
        Header: columnNames.includes(columnName) ? this.getHeader(columnName) : "",
        accessor: filteredFields[columnName] || filteredFields.twoFactor,
        headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
        Cell: row => {
          return (
            <AccountsTableRow row={row} columnName={columnName} {...this.props} />
          );
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
          <div style={{  width: "100%" }}>
            <span style={{ position: "relative", left: "10%", top: "5px" }}><Checkbox /> </span>
            <span style={{ position: "relative", left: "10%", top: "5px" }}> Name </span>
            <span style={{ position: "relative", left: "15%", top: "5px" }}><Icon icon="chevron-down" /></span>
          </div>
      );
    }
    if (headerName === "Email") {
      return (
        <div style={{  width: "100%" }}>
          <span style={{ position: "relative", top: "5px" }}>Email </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
    if (headerName === "Updated") {
      return (
        <div style={{  width: "100%" }}>
          <span style={{ position: "relative", top: "5px" }}>Last Active </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
    if (headerName === "Two Factor") {
      return (
        <div style={{  width: "100%" }}>
          <span style={{ position: "relative", top: "5px" }}>Two Factor </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
  }

  render() {
    return (
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle={this.props.headerLabel}
            title={this.props.headerLabel}
            id="accounts"
          />
          <CardBody expandable={true} id="accounts">
          {this.renderTable(this.props.users)}
          </CardBody>
        </Card>
    );
  }
}
export default AccountsTable;

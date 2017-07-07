import React, { Component } from "react";
import PropTypes from "prop-types";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import * as Collections from "/lib/collections";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";


class AccountsTable extends Component {
  static propTypes = {
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
          const key = row.column.id;
          if (columnName === "Name") {
            return (
                <div className="" style={{ display: "flex", borderRight: "1px solid #cccccc" }}>
                  <span><img className="circular-icon accounts-field-profile" style={{ borderRadius: "50%" }} src={this.getGravatar(row.value)}/></span>
                  <span style={{ position: "relative", left: "5%", fontSize: "14px", top: "30%" }}><strong>{row.value.name}</strong></span>
                </div>
            );
          }
          if (key === "emails[0].address") {
            return (
                <div className="">
                  <span style={{ fontSize: "14px", postion: "relative", top: "30%" }}>{row.value}</span>
                </div>
            );
          }
          if (key === "createdAt") {
            return (
              <div className="">
                    <span style={{ fontSize: "14px", position: "relative", top: "30%" }}>{row.value.toDateString()}</span>
              </div>
            );
          }
          if (columnName === "Two Factor") {
            return (
              <div className="">
                <span style={{ fontSize: "14px", position: "relative", top: "30%" }}>Yes</span>
              </div>
            );
          }
          if (columnName === "Dropdown") {
            return (
              <span id="dropdown">
                <button className="btn btn-default basic-btn"
                  data-event-action="showMemberSettings"
                  data-i18n="accountsUI.showManager"
                >Show Manger</button>
                </span>
            );
          }
          if (columnName === "Button") {
            return (
              <span id="accounts-btn">
                <button
                  data-event-action="showMemberSettings"
                  data-i18n="accountsUI.Remove"
                >Remove</button>
              </span>
            );
          }
        }
      };
      columnMetadata.push(columnMeta);
    });
    return (
      <SortableTable
        tableClassName="-highlight"
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
          <div className="">
            <span style={{ position: "relative", left: "10%", top: "5px" }}><Checkbox /> </span>
            <span style={{ position: "relative", left: "10%", top: "5px" }}> Name </span>
            <span style={{ position: "relative", left: "15%", top: "5px" }}><Icon icon="chevron-down" /></span>
          </div>
      );
    }
    if (headerName === "Email") {
      return (
        <div className="">
          <span style={{ position: "relative", top: "5px" }}>Email </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
    if (headerName === "Updated") {
      return (
        <div className="">
          <span style={{ position: "relative", top: "5px" }}>Last Active </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
    if (headerName === "Two Factor") {
      return (
        <div className="">
          <span style={{ position: "relative", top: "5px" }}>Two Factor </span>
          <span style={{ position: "relative", left: "5%", top: "5px" }}><Icon icon="chevron-down" /></span>
        </div>
      );
    }
  }
  getRows() {
    const users = [];
    this.props.users.forEach(user => {
      users.push(Object.assign({}, this.getUserDetails(user)));
    });
    return users;
  }
  getUserDetails(userId) {
    if (!userId) { return false; }
    const user = Collections.Accounts.findOne(userId);
    const twoFactor = user.emails[0].verified ? "Yes" : "no";
    return {
      twoFactor
    };
  }
  getGravatar(user) {
    const options = {
      secure: true,
      size: 30,
      default: "identicon"
    };
    if (!user) { return false; }
    const account = Collections.Accounts.findOne(user._id);
    if (account && account.profile && account.profile.picture) {
      return account.profile.picture;
    }
    if (user.emails && user.emails.length > 0) {
      const email = user.emails[0].address;
      return Gravatar.imageUrl(email, options);
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

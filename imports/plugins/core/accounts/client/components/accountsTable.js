import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import AccountsListItem from "./accountsListItem";
import * as Collections from "/lib/collections";
import { Card, CardHeader, CardBody, CardGroup, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
<<<<<<< HEAD
=======
import { i18next } from "/client/api";
>>>>>>> test


class AccountsTable extends Component {
  static propTypes = {
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string,
    users: PropTypes.array
  }
<<<<<<< HEAD
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

  getUserDetails(user) {
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

  renderHeader() {
    const baseStyle = classnames({
      "list-group-item": true,
      "flex": true,
      "Rectangle-Copy": true
    });
    return (
      <li className={baseStyle}>
        <div className="member-list-item-image accounts-header-name table-width">
          <span><Checkbox /> </span>
          <span> Name <Icon icon="chevron-down" /></span>
        </div>
        <div className="member-list-item-profile accounts-header-email table-width">
          <div>Email <Icon icon="chevron-down" /></div>
        </div>
        <div className="member-list-item-profile accounts-header-last-active table-width" style={{ paddingRight: "6%" }}>
          <div>Last Active <Icon icon="chevron-down" /></div>
        </div>
        <div className="member-list-item-profile accounts-header-factor table-width">
          <div>Two Factor <Icon icon="chevron-down" /></div>
        </div>
      </li>
    );
  }

  renderRows() {
    const baseStyle = classnames({
      "list-group-item": true,
      "flex": true,
      "account-body": true
    });
    return this.props.users.map((user, index) => (
      <li className={baseStyle} key={index}>
        <div className="member-list-item-profile accounts-field-profile table-width">
          <span style={{ margin: "2%" }}><img className="circular-icon accounts-field-profile" src={this.getGravatar(user)}/></span>
          <span>{this.getUserDetails(user).name}</span>
        </div>
        <div className="member-list-item-profile accounts-field table-width">
          &nbsp;{this.getUserDetails(user).email}
        </div>
        <div className="member-list-item-profile accounts-field accounts-body-last-active table-width">
          <span>{this.getUserDetails(user).lastUpdated}</span>
        </div>
        <div className="member-list-item-profile accounts-field accounts-body-factor table-width">
          <span>{this.getUserDetails(user).twoFactor}</span>
        </div>

        <div className="member-list-item-controls dropdown-div table-width">
          <button className="btn btn-default basic-btn" data-event-action="showMemberSettings" data-i18n="accountsUI.manage">Manage</button>
        </div>
        <div className="member-list-item-controls remove-div table-width">
          <button
            className="btn btn-default remove-btn"
            data-event-action="showMemberSettings"
            data-i18n="accountsUI.Remove"
          >Remove</button>
        </div>
      </li>
    ));
  }
  // render() {
  //   const status = this.props.headerLabel === "Shop Manager";
  //   return (
  //     <ul className="list-group push-bottom">
  //       <AccountsListItem
  //         headerButton={status}
  //         label={this.props.headerLabel}
  //         actionType="arrow"
  //       />
  //       {this.renderHeader()}
  //       {this.renderRows()}
  //     </ul>
  //   );
  // }
  render() {
    console.log("popiu", this.props.users);
    console.log('rows', this.getRows());
    const columnNames = Object.keys(this.getRows());
    return (
      <CardGroup>
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle={this.props.headerLabel}
            title={this.props.headerLabel}
          />
          <CardBody expandable={true} id="accounts">
          {this.renderTable(this.props.users)}
          </CardBody>
        </Card>
          <CardBody expandable={true}>
            <SortableTable
              tableClassName="-highlight"
              data={this.props.users}
              columnMetadata={this.getColumns()}
              externalLoadingComponent={Loading}
              filteredFields={columnNames}
            />
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}
export default AccountsTable;

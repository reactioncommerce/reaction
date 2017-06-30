import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import AccountsListItem from "./accountsListItem";
import * as Collections from "/lib/collections";
import { Card, CardHeader, CardBody, CardGroup, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";


class AccountsTable extends Component {
  static propTypes = {
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string,
    users: PropTypes.array
  }

  renderTable(users) {
    // const { filteredFields } = 
  }

  getColumns() {
    const columns = [{
      Header: i18next.t("admin.logs.headers.name"),
      id: "userName",
      accessor: d => d.name
    },
    {
      Header: i18next.t("admin.logs.headers.email"),
      id: "email",
      accessor: d => d.email
    },
    {
      Header: i18next.t("admin.logs.headers.updated"),
      id: "updated",
      accessor: d => d.lastUpdated
    },
    {
      Header: "Two Factor",
      id: "twoFactor",
      accessor: d => d.twoFactor
    }
    ];
    return columns;
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
      name: user.name,
      lastUpdated: user.createdAt.toDateString(),
      email: user.emails[0].address,
      twoFactor
    };
  }

  getGravatar(user) {
    const options = {
      secure: true,
      size: 40,
      default: "identicon"
    };
    if (!user) { return false; }
    const account = Collections.Accounts.findOne(user._id);
    if (account && account.profile && account.profile.picture) {
      return account.profile.picture;
    }
    if (user.emails && user.emails.length === 1) {
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
            style={{ backgroundColor: "#ebf7fc" }}
            id="accounts"
          />
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import AccountsListItem from "./accountsListItem";


class AccountsTable extends Component {
  static propTypes = {
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string,
    users: PropTypes.array
  }

  renderHeader() {
    const baseStyle = classnames({
      "list-group-item": true,
      "flex": true,
      "Rectangle-Copy": true
    });
    return (
      <li className={baseStyle} style={{ padding: "0px" }}>
        <div className="member-list-item-image accounts-profile-header">
          <span><Checkbox /> </span>
          <span> Name <Icon icon="chevron-down" /></span>
        </div>
        <div className="member-list-item-profile accounts-field" style={{ paddingRight: "4%" }}>
          <div>Email <Icon icon="chevron-down" /></div>
        </div>
        <div className="member-list-item-profile accounts-last-active" style={{ paddingRight: "6%" }}>
          <div>Last Active <Icon icon="chevron-down" /></div>
        </div>
        <div className="member-list-item-profile">
          <div>Two Factor <Icon icon="chevron-down" /></div>
        </div>
        <div className="member-list-item-profile accounts-field"/>
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
        <div className="member-list-item-profile accounts-field-profile">
          <span><img className="circular-icon accounts-field-profile"/></span>
          <span>Rowland Henshaw</span>
        </div>
        <div className="member-list-item-profile accounts-field">
          &nbsp;{user.emails[0].address}
        </div>
        <div className="member-list-item-profile accounts-field">
          <span>22:06 am</span>
        </div>
        <div className="member-list-item-profile accounts-field">
          <span>Yes</span>
        </div>

        <div className="member-list-item-controls dropdown-div">
          <button className="btn btn-default basic-btn" data-event-action="showMemberSettings" data-i18n="accountsUI.manage">Manage</button>
        </div>
        <div className="member-list-item-controls remove-div">
          <button
            className="btn btn-default remove-btn"
            data-event-action="showMemberSettings"
            data-i18n="accountsUI.Remove"
          >Remove</button>
        </div>
      </li>
    ));
  }
  render() {
    const status = this.props.headerLabel === "Shop Manager";
    return (
      <ul className="list-group push-bottom">
        <AccountsListItem
          headerButton={status}
          label={this.props.headerLabel}
          actionType="arrow"
        />
        {this.renderHeader()}
        {this.renderRows()}
      </ul>
    );
  }
}

export default AccountsTable;

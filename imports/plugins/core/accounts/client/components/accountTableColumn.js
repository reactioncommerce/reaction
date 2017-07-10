import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Collections from "/lib/collections";
import classnames from "classnames";

class AccountTableColumn extends Component {
  static propTypes = {
    columnName: PropTypes.string,
    groups: PropTypes.object,
    headerLabel: PropTypes.string,
    row: PropTypes.object
  }

  state = {
    showGroupDropdown: false
  }

  handleGroupDropdown= (e) => {
    e.preventDefault();
    this.setState({
      showGroupDropdown: !this.state.showGroupDropdown
    });
  }

  handleSelected = () => {
    // TODO: reassigning user from group will be handled using row.original
    // const { row } = this.props;
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
    const { row, columnName, groups } = this.props;
    let key = row.column.id;

    if (columnName === "Name") {
      return (
                <div className="" style={{ display: "flex", borderRight: "1px solid #cccccc", width: "100%" }}>
                  <span><img className="circular-icon accounts-field-profile" style={{ borderRadius: "50%" }} src={this.getGravatar(row.value)}/></span>
                  <span style={{ position: "relative", left: "5%", fontSize: "14px", top: "30%" }}><strong>{row.value.name}</strong></span>
                </div>
      );
    }
    if (key === "emails[0].address") {
      return (
                <div style={{  width: "100%" }}>
                  <span style={{ fontSize: "14px", postion: "relative", top: "30%" }}>{row.value}</span>
                </div>
      );
    }
    if (key === "createdAt") {
      return (
              <div style={{  width: "100%" }}>
                    <span style={{ fontSize: "14px", position: "relative", top: "30%" }}>{row.value.toDateString()}</span>
              </div>
      );
    }
    if (columnName === "Two Factor") {
      return (
              <div style={{  width: "100%" }}>
                <span style={{ fontSize: "14px", position: "relative", top: "30%" }}>Yes</span>
              </div>
      );
    }
    if (columnName === "Dropdown") {
      key = `dropdown-${row.value.name}`;
      const dropDownClassName = classnames({
        "accounts-dropdown-list": true,
        "active": this.state.showGroupDropdown
      });

      const dropDownToggleClassName = classnames({
        "accounts-link": true,
        "accounts-dropdown-toggle": true,
        "flipped": this.state.showGroupDropdown,
        "btn": true,
        "btn-default": true,
        "basic-btn": true,
        "account-dropdown-btn": true
      });

      return (
              <span className="reaction-nav-dropdown" key={key} style={{ width: "100%" }}>
                <button className={dropDownToggleClassName}
                  data-event-action="showGroupDropdown"
                  data-i18n="accountsUI.showManager"
                  onClick={this.handleGroupDropdown}
                  key={row.index}
                  style={{ width: "98%" }}
                >{this.props.headerLabel}</button>
                <ul className={dropDownClassName} key={key}>
                {Object.keys(groups).map((group, index) =>
                    <li
                      key={index}
                      style={{ height: "inherit", fontSize: "16px", fontWeight: "600", letterSpacing: "0.3px", textAlign: "left", color: "#5e6264" }}
                      onClick={this.handleSelected}
                    >
                      <span>{group}</span>
                    </li>
                  )
                }
                </ul>
                </span>
      );
    }
    if (columnName === "Button") {
      return (
              <span id="accounts-btn">
                <button
                  data-event-action="showMemberSettings"
                  data-i18n="accountsUI.Remove"
                  style={{ position: "relative", left: "15px" }}
                >Remove</button>
              </span>
      );
    }
  }
}

export default AccountTableColumn;

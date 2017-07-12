import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { getGravatar } from "../helpers/accountsHelper";

class AccountsTableRow extends Component {
  static propTypes = {
    columnName: PropTypes.string,
    groups: PropTypes.object,
    headerLabel: PropTypes.string,
    row: PropTypes.object
  };

  state = {
    showGroupDropdown: false
  };

  handleGroupDropdown = e => {
    e.preventDefault();
    this.setState({
      showGroupDropdown: !this.state.showGroupDropdown
    });
  };

  handleSelected = () => {
    // TODO: reassigning user from group will be handled using row.original
    // const { row } = this.props;
  };

  render() {
    const { row, columnName, groups } = this.props;
    let key = row.column.id;

    // TODO: Use set constant to loop through
    if (columnName === "Name") {
      return (
        <div
          className="table-cell body-first"
        >
          <span>
            <img
              className="circular-icon accounts-field-profile img-cell"
              src={getGravatar(row.value)}
            />
          </span>
          <span className="name-cell">
            <strong>{row.value.name}</strong>
          </span>
        </div>
      );
    }

    if (key === "emails[0].address") {
      return (
        <div className="table-cell body">
          <span>{row.value}</span>
        </div>
      );
    }

    if (key === "createdAt") {
      return (
        <div className="table-cell body">
          <span>
            {row.value && row.value.toDateString()}
          </span>
        </div>
      );
    }

    if (columnName === "Two Factor") {
      return (
        <div className="table-cell body">
          <span>Yes</span>
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
        "account-dropdown-btn": true,
        "width-98": true
      });

      return (
        <span className="reaction-nav-dropdown full-width" key={key}>
          <button
            className={dropDownToggleClassName}
            data-event-action="showGroupDropdown"
            data-i18n="accountsUI.showManager"
            onClick={this.handleGroupDropdown}
            key={row.index}
          >
            {this.props.headerLabel}
          </button>
          <ul className={dropDownClassName} key={key}>
            {Object.keys(groups).map((group, index) => (
              <li
                key={index}
                className="drop-down list cell"
                onClick={this.handleSelected}
              >
                <span>{group}</span>
              </li>
            ))}
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
            className="accounts-btn"
          >
            Remove
          </button>
        </span>
      );
    }
    return null;
  }
}

export default AccountsTableRow;

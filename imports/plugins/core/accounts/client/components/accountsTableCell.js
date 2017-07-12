import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { getGravatar } from "../helpers/accountsHelper";

class AccountsTableCell extends Component {
  static propTypes = {
    columnName: PropTypes.string,
    data: PropTypes.object,
    headerLabel: PropTypes.string
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
    const { data, columnName } = this.props;
    let key = data.column.id;

    // TODO: Use set constant to loop through
    if (columnName === "name") {
      return (
        <div className="table-cell body-first">
          <span>
            <img className="circular-icon accounts-field-profile img-cell" src={getGravatar(data.original)} />
          </span>
          <span className="name-cell">
            <strong>{data.value || "Guest"}</strong>
          </span>
        </div>
      );
    }

    if (columnName === "email") {
      console.log({ data });
      return (
        <div className="table-cell body">
          <span>{data.value}</span>
        </div>
      );
    }

    if (columnName === "createdAt") {
      return (
        <div className="table-cell body">
          <span>
            {data.value && data.value.toDateString()}
          </span>
        </div>
      );
    }

    if (columnName === "twoFactor") {
      return (
        <div className="table-cell body">
          <span>Yes</span>
        </div>
      );
    }

    if (columnName === "dropdown") {
      key = `dropdown-${data.value.name}`;
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
            key={data.index}
          >
            {this.props.headerLabel}
          </button>
          <ul className={dropDownClassName} key={key}>
            {Object.keys([]).map((group, index) => ( //groups
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

    if (columnName === "button") {
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

export default AccountsTableCell;

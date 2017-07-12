import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { getGravatar } from "../helpers/accountsHelper";
import { MenuItem, DropDownMenu } from "@reactioncommerce/reaction-ui";

const menuStyle = {
  padding: "0px 10px 10px 10px",
  minWidth: 220,
  minHeight: 50
};

class AccountsTableCell extends Component {
  static propTypes = {
    columnName: PropTypes.string,
    data: PropTypes.object,
    groups: PropTypes.array,
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
      console.log({ pr: this.props });

      return (
        <DropDownMenu
          onChange={this.handleSelected}
          menuStyle={menuStyle}
          attachment="bottom center"
        >
          {this.props.groups.map((grp, index) => (
            <MenuItem
              key={index} // TODO: i18n
              label={_.startCase(grp.name)}
              selectLabel={_.startCase(grp.name)}
              value={grp.slug}
            />
          ))}
        </DropDownMenu>
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

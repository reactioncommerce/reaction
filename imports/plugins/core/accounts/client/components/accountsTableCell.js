import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { getGravatar } from "../helpers/accountsHelper";
import { Button, MenuItem, DropDownMenu } from "@reactioncommerce/reaction-ui";

const menuStyle = {
  padding: "0px 10px 10px 10px",
  minWidth: 220,
  minHeight: 50
};

class AccountsTableCell extends Component {
  static propTypes = {
    account: PropTypes.object,
    columnName: PropTypes.string,
    group: PropTypes.object, // current group in interation
    groups: PropTypes.array, // all available groups
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

  handleGroupChange = account => {
    return (event, groupId) => {
      Meteor.call("group/addUser", account._id, groupId, (err) => {
        if (err) {
          return Alerts.toast("Error updating user" + err, "error"); // TODO: Swith to React + i18n
        }
        Alerts.toast("User changed successfully", "success"); // TODO: Swith to React + i18n
      });
    };
  };

  handleGroupRemove = account => {
    return (event, groupId) => {
      Meteor.call("group/removeUser", account._id, groupId, (err) => {
        if (err) {
          return Alerts.toast("Error updating user" + err, "error"); // TODO: Swith to React + i18n
        }
        Alerts.toast("User removed successfully", "success"); // TODO: Swith to React + i18n
      });
    };
  }

  dropDownButton() {
    return (
      <Button label={this.props.group.name && _.startCase(this.props.group.name)}>
        &nbsp;<i className="fa fa-caret-down" />
      </Button>
    );
  }

  render() {
    const { account, columnName } = this.props;

    // TODO: Use set constant to loop through
    if (columnName === "name") {
      return (
        <div className="table-cell body-first">
          <span>
            <img className="circular-icon accounts-field-profile img-cell" src={getGravatar(account)} />
          </span>
          <span className="name-cell">
            <strong>{account.name || "Guest"}</strong>
          </span>
        </div>
      ); // TODO: Review "Guest" default
    }

    if (columnName === "email") {
      return (
        <div className="table-cell body">
          <span>{_.get(account, "emails[0].address")}</span>
        </div>
      );
    }

    if (columnName === "createdAt") {
      return (
        <div className="table-cell body">
          <span>
            {account.createdAt && account.createdAt.toDateString()}
          </span>
        </div>
      );
    }

    if (columnName === "twoFactor") {
      // TODO: What should twoFactor be?
      return (
        <div className="table-cell body">
          <span>Yes</span>
        </div>
      );
    }

    if (columnName === "dropdown") {
      return (
        <DropDownMenu
          menuStyle={menuStyle}
          buttonElement={this.dropDownButton()}
          attachment="bottom center"
          onChange={this.handleGroupChange(account)}
        >
          {this.props.groups.filter(grp => grp._id !== this.props.group._id).map((grp, index) => (
            <MenuItem
              key={index} // TODO: i18n
              label={_.startCase(grp.name)}
              selectLabel={_.startCase(grp.name)}
              value={grp._id}
            />
          ))}
        </DropDownMenu>
      );
    }

    if (columnName === "button") {
      return (
        <span id="accounts-btn">
          <Button
            data-event-action="showMemberSettings"
            data-i18n="accountsUI.Remove"
            className="accounts-btn"
            onClick={this.handleGroupRemove(account)}
          >
            Remove
          </Button>
        </span>
      );
    }
    return null;
  }
}

export default AccountsTableCell;

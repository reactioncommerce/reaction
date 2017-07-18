import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { getGravatar } from "../helpers/accountsHelper";
import { Button, MenuItem, DropDownMenu } from "@reactioncommerce/reaction-ui";

class AccountsTableCell extends Component {
  static propTypes = {
    account: PropTypes.object,
    columnName: PropTypes.string,
    group: PropTypes.object, // current group in interation
    groups: PropTypes.array // all available groups
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
    return () => {
      Meteor.call("group/removeUser", account._id, this.props.group._id, (err) => {
        if (err) {
          return Alerts.toast("Error updating user" + err, "error"); // TODO: Swith to React + i18n
        }
        Alerts.toast("User removed successfully", "success"); // TODO: Swith to React + i18n
      });
    };
  }

  dropDownButton() {
    return (
      <div className="group-dropdown">
        <Button label={this.props.group.name && _.startCase(this.props.group.name)}>
          &nbsp;<i className="fa fa-chevron-down" />
        </Button>
      </div>
    );
  }

  render() {
    const { account, columnName } = this.props;

    if (columnName === "name") {
      return (
        <div className="table-cell body-first">
          <img className="accounts-img-tag" src={getGravatar(account)} />
          <span><b>{account.name}</b></span>
        </div>
      );
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

    if (columnName === "dropdown") {
      return (
        <DropDownMenu
          buttonElement={this.dropDownButton()}
          attachment="bottom center"
          onChange={this.handleGroupChange(account)}
        >
          {this.props.groups.filter(grp => grp._id !== this.props.group._id).map((grp, index) => (
            <MenuItem
              key={index}
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
        <div>
          <Button
            status="danger"
            onClick={this.handleGroupRemove(account)}
            bezelStyle="solid"
            i18nKeyLabel="admin.groups.remove"
            label="Remove"
          />
        </div>
      );
    }
    return null;
  }
}

export default AccountsTableCell;

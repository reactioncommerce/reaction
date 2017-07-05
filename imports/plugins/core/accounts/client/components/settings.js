import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import _ from "lodash";
import { Shops } from "/lib/collections";
import AddAdmninForm from "./addAdminForm";
import GroupSettings from "./groupSettings";


class SettingsComponent extends Component {
  static propTypes = {
    accounts: PropTypes.array
  }

  getUserGroups() {
    const shopManagers = [];
    const fufillment = [];
    const customerServicers = [];
    const merchandisers = [];
    this.props.accounts.forEach((account) => {
      const userGroup = _.get(Shops.findOne(
        {
          _id: account.shopId
        }
      ), "groups").filter(group => group._id === account.groups[0].groupId[0]);
      if (userGroup[0]) {
        const groupName = userGroup[0].name;
        if (groupName === "Shop Manager") {
          shopManagers.push(Object.assign({}, { groupName }, account));
        }
        if (groupName === "Merchandiser") {
          merchandisers.push(Object.assign({}, { groupName }, account));
        }
        if (groupName === "Fufillment") {
          fufillment.push(Object.assign({}, { groupName }, account));
        }
        if (groupName === "Customer Service") {
          customerServicers.push(Object.assign({}, { groupName }, account));
        }
      }
    });

    return  { shopManagers, customerServicers, fufillment, merchandisers };
  }

  renderAddAdminForm() {
    return (
        <AddAdmninForm />
    );
  }

  renderGroupSettings() {
    const groups = this.getUserGroups();
    console.log('groups', groups);
    return (
        <GroupSettings groups={groups} />
    );
  }

  render() {
    return (
        <div className="groups-form">
        {this.renderAddAdminForm()}
        {this.renderGroupSettings()}
        </div>
    );
  }
}

export default SettingsComponent;

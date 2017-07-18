import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts, Groups } from "/lib/collections";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import AccountsDashboard from "../components/accountsDashboard";
import sortUsersIntoGroups from "../helpers/accountsHelper";

class AccountsDashboardContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array
  };

  render() {
    const { accounts, groups } = this.props;
    return <AccountsDashboard groups={sortUsersIntoGroups(accounts, groups)} accounts={accounts} />;
  }
}

const composer = (props, onData) => {
  const adminUserSub = Meteor.subscribe("Accounts", null);
  const grpSub = Meteor.subscribe("Groups");
  // TODO: Review with Spencer
  if (adminUserSub.ready() && grpSub.ready()) {
    const groups = Groups.find({ slug: { $nin: ["customer", "guest"] } }).fetch();
    const adminQuery = {
      [`roles.${Reaction.getShopId()}`]: {
        $in: ["dashboard"]
      }
    };

    const adminUsers = Meteor.users.find(adminQuery, { fields: { _id: 1 } }).fetch();
    const ids = adminUsers.map(user => user._id);
    const accounts = Accounts.find({ _id: { $in: ids }, shopId: Reaction.getShopId() }).fetch();

    onData(null, { accounts, groups });
  }
};

export default composeWithTracker(composer)(AccountsDashboardContainer);

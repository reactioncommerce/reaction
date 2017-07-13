import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts, Groups } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsDashboard from "../components/accountsDashboard";
import sortUsersIntoGroups from "../helpers/accountsHelper";

class AccountsDashboardContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array
  }

  render() {
    const { accounts, groups } = this.props;
    return (
      <AccountsDashboard groups={sortUsersIntoGroups(accounts, groups)} accounts={accounts} />
    );
  }
}

const composer = (props, onData) => {
  const accSub = Meteor.subscribe("AdminAccounts");
  const grpSub = Meteor.subscribe("Groups");

  if (accSub.ready() && grpSub.ready()) {
    const accounts = Accounts.find().fetch();
    const groups = Groups.find().fetch();
    onData(null, { accounts, groups });
  }
};

export default composeWithTracker(composer)(AccountsDashboardContainer);

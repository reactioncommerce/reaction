import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts, Groups } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsDashboard from "../components/accountsDashboard";
import getSortedGroups from "../helpers/accountsHelper";

class AccountsDashboardContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
  }

  render() {
    const { shopUsers, groups } = this.props;
    return (
      <AccountsDashboard accounts={this.props.shopUsers} groups={getSortedGroups(shopUsers, groups)} />
    );
  }
}

const composer = (props, onData) => {
  const accSub = Meteor.subscribe("Accounts", null);
  const grpSub = Meteor.subscribe("Groups");

  if (accSub.ready() && grpSub.ready()) {
    const shopUsers = Accounts.find().fetch();
    const groups = Groups.find().fetch();
    onData(null, { shopUsers, groups });
  }
};

export default composeWithTracker(composer)(AccountsDashboardContainer);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts, Groups } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsComponent from "../components/accounts";
import { getSortedGroups } from "../helpers/accountsHelper";

class AccountsContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
  }

  render() {
    const { shopUsers, groups } = this.props;
    return (
      <AccountsComponent accounts={this.props.shopUsers} groups={getSortedGroups(shopUsers, groups)} />
    );
  }
}

const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();
  const groups = Groups.find().fetch();
  onData(null, {
    shopUsers, groups
  });
};

export default composeWithTracker(composer, null)(AccountsContainer);

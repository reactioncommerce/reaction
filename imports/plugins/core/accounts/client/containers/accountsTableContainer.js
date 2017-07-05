import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts, Groups, Shops } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsComponent from "../components/accounts";

class AccountsContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
  }

  render() {
    return (
      <AccountsComponent accounts={this.props.shopUsers} groups={this.props.groups} />
    );
  }
}

const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();
  const groups = Groups.find();
  console.log("grew", Groups.find().fetch());

  onData(null, {
    shopUsers, groups
  });
};

export default composeWithTracker(composer, null)(AccountsContainer);

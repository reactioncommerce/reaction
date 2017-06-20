import React, { Component } from "react";
import PropTypes from "prop-types";
import { Accounts } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsComponent from "../components/accounts";

class AccountsContainer extends Component {
  static propTypes = {
    shopUsers: PropTypes.array
  }

  render() {
    return (
      <AccountsComponent accounts={this.props.shopUsers} />
    );
  }
}

const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();

  onData(null, {
    shopUsers
  });
};

export default composeWithTracker(composer, null)(AccountsContainer);

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

  getFilteredGroups() {
    const allGroups = {};
    this.props.groups.forEach((group) => {
      if (!allGroups.hasOwnProperty(group.name)) {
        allGroups[group.name] = Object.assign({}, { group }, { ids: [group._id] });
      } else {
        allGroups[group.name].ids.push(group._id);
      }
    });
    return allGroups;
  }

  getSortedGroups() {
    const allGroups = this.getFilteredGroups();
    const sortedGroups = {};
    Object.keys(allGroups).forEach((groupName) => {
      sortedGroups[groupName] = this.props.shopUsers.filter(function (user) {
        return user.groups.length > 0 && allGroups[groupName].ids.includes(user.groups[0]);
      });
    });
    return sortedGroups;
  }

  render() {
    return (
      <AccountsComponent accounts={this.props.shopUsers} groups={this.getSortedGroups()} />
    );
  }
}

const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();
  // const userId = Meteor.userId();
  // const groupsSub = Meteor.subscribe("Groups", userId);
  const groups = Groups.find().fetch();
  // if (groupsSub.ready()) {
  //   groups = Groups.find().fetch();
  // }
  onData(null, {
    shopUsers, groups
  });
};

export default composeWithTracker(composer, null)(AccountsContainer);

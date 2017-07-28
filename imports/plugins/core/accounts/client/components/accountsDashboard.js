import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import sortUsersIntoGroups from "../helpers/accountsHelper";

class AccountsDashboard extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);
    const { groups, accounts } = this.props;
    const sortedGroups = sortUsersIntoGroups({ groups, accounts }) || [];
    const defaultSelectedGroup = sortedGroups[0];

    this.state = {
      accounts: accounts,
      groups: sortedGroups,
      selectedGroup: defaultSelectedGroup
    };
  }

  componentWillReceiveProps(nextProps) {
    const { groups, accounts } = nextProps;
    const sortedGroups = sortUsersIntoGroups({ groups, accounts });
    const selectedGroup = groups.find((grp) => grp._id === (this.state.selectedGroup || {})._id);
    this.setState({ groups: sortedGroups, accounts, selectedGroup });
  }

  handleGroupSelect = (group) => {
    this.setState({ selectedGroup: group });
  };

  renderGroupDetail = () => {
    const { groups, accounts } = this.state;
    return (
      <Components.ManageGroups
        group={this.state.selectedGroup}
        groups={groups}
        accounts={accounts}
        onChangeGroup={this.handleGroupSelect}
      />
    );
  };

  renderGroupsTable(groups) {
    if (Array.isArray(groups)) {
      return groups.map((group, index) => {
        return (
          <Components.GroupsTable key={index} group={group} onGroupSelect={this.handleGroupSelect} {...this.props} />
        );
      });
    }

    return null;
  }

  render() {
    return (
      <div className="row list-group accounts-table">
        <div className="col-md-9">
          {this.renderGroupsTable(this.state.groups)}
        </div>
        <div className="col-md-3">
          {this.renderGroupDetail()}
        </div>
      </div>
    );
  }
}

export default AccountsDashboard;

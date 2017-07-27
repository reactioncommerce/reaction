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

    this.state = {
      accounts: accounts,
      groups: sortUsersIntoGroups({ groups, accounts }),
      showSideBar: false,
      selectedGroup: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    const { groups, accounts } = nextProps;
    const sortedGroups = sortUsersIntoGroups({ groups, accounts });
    const selectedGroup = groups.find((grp) => grp._id === (this.state.selectedGroup || {})._id);
    this.setState({ groups: sortedGroups, accounts, selectedGroup });
  }

  handleGroupSelect = (group) => {
    this.setState({ showSideBar: true, selectedGroup: group });
  };

  tableClassName() {
    if (this.state.showSideBar) {
      return "col-md-9";
    }
    return "col-md-12";
  }

  detailDivClassName() {
    if (this.state.showSideBar) {
      return "col-md-3";
    }
    return "hide";
  }

  renderGroupDetail = () => {
    if (this.state.showSideBar) {
      const { groups, accounts } = this.state;
      return (
        <Components.ManageGroups
          group={this.state.selectedGroup}
          groups={groups}
          accounts={accounts}
          onChangeGroup={this.handleGroupSelect}
        />
      );
    }
    return null;
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
        <div className={this.tableClassName()}>
          {this.renderGroupsTable(this.state.groups)}
        </div>
        <div className={this.detailDivClassName()}>
          {this.renderGroupDetail()}
        </div>
      </div>
    );
  }
}

export default AccountsDashboard;

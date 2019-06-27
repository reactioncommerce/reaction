import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import sortUsersIntoGroups, { sortGroups } from "../helpers/accountsHelper";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import DetailDrawerButton from "/imports/client/ui/components/DetailDrawerButton";

class AccountsDashboard extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    adminGroups: PropTypes.array, // only admin groups
    groups: PropTypes.array // all groups including non-admin default groups
  };

  constructor(props) {
    super(props);
    const { accounts, adminGroups, groups } = this.props;
    const sortedGroups = sortUsersIntoGroups({ groups: sortGroups(adminGroups), accounts }) || [];
    const defaultSelectedGroup = sortedGroups[0];

    this.state = {
      accounts,
      groups: sortGroups(groups),
      adminGroups: sortedGroups,
      selectedGroup: defaultSelectedGroup
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { adminGroups, accounts, groups } = nextProps;
    const sortedGroups = sortUsersIntoGroups({ groups: sortGroups(adminGroups), accounts });
    const selectedGroup = adminGroups.find((grp) => grp._id === (this.state.selectedGroup || {})._id);
    this.setState({
      adminGroups: sortedGroups,
      groups: sortGroups(groups),
      accounts,
      selectedGroup
    });
  }

  handleGroupSelect = (group) => {
    this.setState({ selectedGroup: group });
  };

  handleMethodLoad = () => {
    this.setState({ loading: true });
  };

  handleMethodDone = () => {
    this.setState({ loading: false });
  };

  renderGroupDetail = () => {
    const { groups, adminGroups, accounts } = this.state;
    return (
      <Components.ManageGroups
        {...this.props}
        group={this.state.selectedGroup}
        groups={groups}
        adminGroups={adminGroups}
        accounts={accounts}
        onChangeGroup={this.handleGroupSelect}
      />
    );
  };

  renderGroupsTable(groups) {
    if (Array.isArray(groups)) {
      return (
        <div className="group-container">
          {this.state.loading && <Components.Loading />}
          {groups.map((group, index) => (
            <Components.GroupsTable
              {...this.props}
              key={index}
              group={group}
              onMethodLoad={this.handleMethodLoad}
              onMethodDone={this.handleMethodDone}
              onGroupSelect={this.handleGroupSelect}
            />
          ))}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <div className="accounts-table">
        <div className="group-container" style={{ textAlign: "right" }}>
          <DetailDrawerButton color="primary" variant="outlined">{i18next.t("admin.dashboard.manageGroups")}</DetailDrawerButton>
        </div>
        {this.renderGroupsTable(this.state.adminGroups)}
        <DetailDrawer title={i18next.t("admin.dashboard.manageGroups")}>
          {this.renderGroupDetail()}
        </DetailDrawer>
      </div>
    );
  }
}

export default AccountsDashboard;

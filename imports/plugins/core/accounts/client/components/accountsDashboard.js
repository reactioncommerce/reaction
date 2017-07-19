import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import AccountsManageContainer from "../containers/accountsManageContainer";

class AccountsDashboard extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      groups: props.groups,
      showSideBar: false,
      selectedGroup: {}
    };
  }

  renderGroupDetail = () => {
    if (this.state.showSideBar) {
      const { groups, accounts } = this.props;
      return <AccountsManageContainer group={this.state.selectedGroup} groups={groups} accounts={accounts} />;
    }
    return null;
  };

  handleGroupSelect = group => {
    this.setState({ showSideBar: true, selectedGroup: group });
  };

  renderGroupsTable(groups) {
    if (Array.isArray(groups)) {
      return groups.map((group, index) => {
        return (
          <div key={index}>
            <AccountsTable group={group} onGroupSelect={this.handleGroupSelect} {...this.props} />
          </div>
        );
      });
    }

    return null;
  }

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

  render() {
    return (
      <div className="row list-group accounts-table">
        <div className={this.tableClassName()}>
          {this.renderGroupsTable(this.props.groups)}
        </div>
        <div className={this.detailDivClassName()}>
          {this.renderGroupDetail()}
        </div>
      </div>
    );
  }
}

export default AccountsDashboard;

import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";

class AccountsDashboard extends Component {
  static propTypes = {
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      groups: props.groups
    };
  }

  renderGroupsTable(groups) {
    if (Array.isArray(groups)) {
      return groups.map((group, index) => {
        return (
          <div className="pus-table groups margin" key={index}>
            <AccountsTable group={group} {...this.props}/>
          </div>
        );
      });
    }

    return null;
  }

  render() {
    return (
      <div className="list-group accounts-table">
        {this.renderGroupsTable(this.props.groups)}
      </div>
    );
  }
}

export default AccountsDashboard;

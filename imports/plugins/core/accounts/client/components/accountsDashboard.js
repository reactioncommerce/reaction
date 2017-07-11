import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsTable from "./accountsTable";
import { Icon } from "/imports/plugins/core/ui/client/components";

class AccountsDashboard extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts
    };
  }

  renderOwnersSection() {
    return (
      <div>
        <div className="accounts-main-row">
          <div className="accounts-hd-col">
            <span className="hd-content">Group</span>
            <span className="hd-icon"><Icon icon="filter" /></span>
          </div>
          <div className="accounts-hd-col center">
            <span className="hd-content">Date</span>
            <span className="hd-icon"><Icon icon="filter" /></span>
          </div>
          <div className="accounts-hd-col">
            <span className="hd-content">Status</span>
            <span className="hd-icon"><Icon icon="filter" /></span>
          </div>
        </div>
        <div className="owners-row">
          <div style={{ width: "30%" }}>
            <span style={{ paddingLeft: "10px" }}>{/* gravatar goes here*/} SS</span>
            <span style={{ paddingLeft: "10px" }}>{/* Name goes here*/} Silver Sparks</span>
          </div>
          <div style={{ width: "20%" }}>
            <span>{/* email goes here*/}silversparks@gmai...</span>
          </div>
          <div style={{ width: "10%" }}>
            <span>{/* last active goes here*/} 10:43</span>
          </div>
          <div style={{ width: "10%" }}>Yes</div>
          <div />
        </div>
      </div>
    );
  }

  renderGroupsTable(groups) {
    // const headerLabel =  { __html: "you" };
    // TODO: set default badge in here
    return Object.keys(groups).map(function(group, index) {
      if (groups[group].length > 0) {
        return (
          <div style={{ marginBottom: "10px" }} key={index}>
            <AccountsTable groups={groups} users={groups[group]} headerLabel={group} />
          </div>
        );
      }
      return null;
    });
  }
  render() {
    return (
      <div className="list-group accounts-table">
        {this.renderOwnersSection()}
        {this.renderGroupsTable(this.props.groups)}
      </div>
    );
  }
}

export default AccountsDashboard;

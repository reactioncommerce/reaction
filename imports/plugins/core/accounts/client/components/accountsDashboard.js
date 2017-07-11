import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Icon } from "/imports/plugins/core/ui/client/components";
import { getGravatar } from "../helpers/accountsHelper";
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

  renderOwnersSection() {
    if (Reaction.hasOwnerAccess() && Reaction.hasAdminAccess()) {
      const owner = Meteor.user();
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
              <span style={{ paddingLeft: "10px" }}>
                <img
                  className="circular-icon accounts-field-profile"
                  style={{ borderRadius: "50%" }}
                  src={getGravatar(owner)}
                />
              </span>
              <span style={{ paddingLeft: "10px" }}>{owner.name}</span>
            </div>
            <div style={{ width: "20%" }}>
              <span>{owner.emails[0].address}</span>
            </div>
            <div style={{ width: "10%" }}>
              <span>10:43</span>
            </div>
            <div style={{ width: "10%" }}>Yes</div>
            <div />
          </div>
        </div>
      );
    }
    return null;
  }

  renderGroupsTable(groups) {
    if (Array.isArray(groups)) {
      return groups.map((group, index) => {
        return (
          <div style={{ marginBottom: "10px" }} key={index}>
            <AccountsTable group={group} headerLabel={group.name} />
          </div>
        );
      });
    }

    return null;
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import AdminInviteForm from "../components/adminInviteForm";
import EditGroup from "../components/editGroup";
import AddGroupMembers from "../components/addGroupMembers";

class AccountsManageContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts
    };
  }

  render() {
    return (
      <div className="groups-form">
        <AdminInviteForm />
        <EditGroup groups={this.props.groups} />
        <AddGroupMembers
          groups={this.props.groups}
          accounts={this.state.accounts}
          group={this.props.group}
        />
      </div>
    );
  }
}

export default AccountsManageContainer;

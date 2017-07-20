import React, { Component } from "react";
import PropTypes from "prop-types";
import AdminInviteForm from "../components/adminInviteForm";
import EditGroupContainer from "./editGroupContainer";
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
      accounts: props.accounts,
      group: props.group,
      groups: props.groups
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ group: nextProps.group, groups: nextProps.groups });
  }

  render() {
    return (
      <div className="groups-form">
        <AdminInviteForm />
        <EditGroupContainer groups={this.state.groups} selectedGroup={this.state.group} />
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

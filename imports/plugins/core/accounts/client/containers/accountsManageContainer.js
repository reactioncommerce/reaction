import React, { Component } from "react";
import PropTypes from "prop-types";
import AdminInviteForm from "../components/adminInviteForm";
import EditGroupContainer from "./editGroupContainer";
import AddGroupMembers from "../components/addGroupMembers";

class AccountsManageContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array,
    onChangeGroup: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts,
      group: props.group,
      groups: props.groups
    };
  }

  componentWillReceiveProps(nextProps) {
    const { group, groups, accounts } = nextProps;
    this.setState({ group, groups, accounts });
  }

  render() {
    return (
      <div className="groups-form">
        <AdminInviteForm />
        <EditGroupContainer
          groups={this.state.groups}
          selectedGroup={this.state.group}
          onChangeGroup={this.props.onChangeGroup}
        />
        <AddGroupMembers groups={this.state.groups} accounts={this.state.accounts} group={this.state.group} />
      </div>
    );
  }
}

export default AccountsManageContainer;

import React, { Component } from "react";
import PropTypes from "prop-types";
import AdminInviteForm from "./adminInviteForm";
import EditGroup from "./editGroup";
import AddGroupMembers from "./addGroupMembers";


class AccountsDashboardDetails extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    getGroupPermissions: PropTypes.func,
    groups: PropTypes.array,
    hasPermissionChecked: PropTypes.func,
    toggleGroupPermission: PropTypes.func
  }

  renderAddAdminForm() {
    return (
      <AdminInviteForm />
    );
  }

  renderGroupSettings() {
    const { groups,
      getGroupPermissions,
      hasPermissionChecked,
      toggleGroupPermission } = this.props;

    return (
      <EditGroup
        groups={groups}
        getGroupPermissions={getGroupPermissions}
        hasPermissionChecked={hasPermissionChecked}
        toggleGroupPermission={toggleGroupPermission}
      />
    );
  }

  renderOwnersTab() {
    return (
      <AddGroupMembers
        groups={this.props.groups}
        accounts={this.props.accounts}
      />
    );
  }

  render() {
    return (
      <div className="groups-form">
        {this.renderAddAdminForm()}
        {/* this.renderGroupSettings() */}
        {/* this.renderOwnersTab() */}
      </div>
    );
  }
}

export default AccountsDashboardDetails;

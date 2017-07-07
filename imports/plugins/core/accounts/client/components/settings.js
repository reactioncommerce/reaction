import React, { Component } from "react";
import PropTypes from "prop-types";
import AddAdmninForm from "./addAdminForm";
import GroupSettings from "./groupSettings";
import GroupOwnerSettings from "./ownerSettings";


class SettingsComponent extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    getGroupPermissions: PropTypes.func,
    groups: PropTypes.object,
    hasPermissionChecked: PropTypes.func,
    toggleGroupPermission: PropTypes.func
  }

  renderAddAdminForm() {
    return (
        <AddAdmninForm />
    );
  }

  renderGroupSettings() {
    const { groups,
      getGroupPermissions,
      hasPermissionChecked,
      toggleGroupPermission } = this.props;

    return (
        <GroupSettings
          groups={groups}
          getGroupPermissions={getGroupPermissions}
          hasPermissionChecked={hasPermissionChecked}
          toggleGroupPermission={toggleGroupPermission}
        />
    );
  }

  renderOwnersTab() {
    return (
      <GroupOwnerSettings
        groups={this.props.groups}
        accounts={this.props.accounts}
      />
    );
  }

  render() {
    return (
        <div className="groups-form">
        {this.renderAddAdminForm()}
        {this.renderGroupSettings()}
        {this.renderOwnersTab()}
        </div>
    );
  }
}

export default SettingsComponent;

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { getInvitableGroups } from "../helpers/accountsHelper";

class ManageGroups extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    adminGroups: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array,
    isAdmin: PropTypes.bool,
    onChangeGroup: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts,
      adminGroups: props.adminGroups,
      group: props.group,
      groups: props.groups
    };
  }

  componentWillReceiveProps(nextProps) {
    const { group, groups, adminGroups, accounts } = nextProps;
    this.setState({ group, groups, accounts, adminGroups });
  }

  render() {
    // this gets a list of groups the user can invite to, we show only those in the dropdown
    // see doc for getInvitableGroups in helpers/accountsHelper.js
    const groupsInvitable = getInvitableGroups(this.state.adminGroups);
    return (
      <div className="groups-form">
        { groupsInvitable && groupsInvitable.length &&
          <Components.AdminInviteForm
            {...this.props}
            groups={groupsInvitable}
          />
        }
        {this.props.isAdmin &&
          <Components.EditGroup
            // filter out owner group from editable groups.
            // The edit group meteor method also prevents editing owner group
            groups={this.state.groups.filter((grp) => grp.slug !== "owner")}
            selectedGroup={this.state.group}
            onChangeGroup={this.props.onChangeGroup}
          />
        }
      </div>
    );
  }
}

registerComponent("ManageGroups", ManageGroups);

export default ManageGroups;

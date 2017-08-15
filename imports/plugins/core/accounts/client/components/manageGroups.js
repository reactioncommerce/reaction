import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class ManageGroups extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    adminGroups: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array,
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
    return (
      <div className="groups-form">
        <Components.AdminInviteForm
          {...this.props}
          groups={this.state.adminGroups}
        />
        <Components.EditGroup
          // filter out owner group from editable groups. The edit group meteor method also prevents editing owner group
          groups={this.state.groups.filter(grp => grp.slug !== "owner")}
          selectedGroup={this.state.group}
          onChangeGroup={this.props.onChangeGroup}
        />
      </div>
    );
  }
}

registerComponent("ManageGroups", ManageGroups);

export default ManageGroups;

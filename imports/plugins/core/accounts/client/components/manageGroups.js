import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class ManageGroups extends Component {
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

  get defaultInviteGroup() {
    let defaultInviteGroup = {};
    const groups = [];
    this.state.groups.forEach((grp) => {
      if (grp.slug !== "owner") {
        groups.push(grp);
      }
    });

    if (groups && groups.length > 0) {
      defaultInviteGroup = groups[0];
    }
    return defaultInviteGroup;
  }

  render() {
    return (
      <div className="groups-form">
        <Components.AdminInviteForm groups={this.state.groups} defaultInviteGroup={this.defaultInviteGroup} />
        <Components.EditGroup
          groups={this.state.groups}
          selectedGroup={this.state.group}
          onChangeGroup={this.props.onChangeGroup}
        />
        <Components.AddGroupMembers groups={this.state.groups} accounts={this.state.accounts} group={this.state.group} />
      </div>
    );
  }
}

registerComponent("ManageGroups", ManageGroups);

export default ManageGroups;

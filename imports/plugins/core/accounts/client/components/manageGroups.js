import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import withStyles from "@material-ui/core/styles/withStyles";
import { getInvitableGroups } from "../helpers/accountsHelper";

const styles = (theme) => ({
  editGroup: {
    paddingTop: theme.spacing()
  }
});

class ManageGroups extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    adminGroups: PropTypes.array,
    classes: PropTypes.object,
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

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { group, groups, adminGroups, accounts } = nextProps;
    this.setState({ group, groups, accounts, adminGroups });
  }

  render() {
    const { classes } = this.props;
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
          <div className={classes.editGroup}>
            <Components.EditGroup
              // filter out owner group from editable groups.
              // The edit group meteor method also prevents editing owner group
              groups={this.state.groups.filter((grp) => grp.slug !== "owner")}
              selectedGroup={this.state.group}
              onChangeGroup={this.props.onChangeGroup}
            />
          </div>
        }
      </div>
    );
  }
}

registerComponent("ManageGroups", ManageGroups, [
  withStyles(styles, { name: "RuiManageGroups" })
]);

export default withStyles(styles, { name: "RuiManageGroups" })(ManageGroups);

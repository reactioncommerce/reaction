import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import {
  List,
  ListItem,
  Card,
  CardHeader,
  CardBody
} from "/imports/plugins/core/ui/client/components";
import PermissionsList from "../components/permissionsList";
import { groupPermissions } from "../helpers/accountsHelper";

class EditGroupContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array,
    packages: PropTypes.array,
    selectedGroup: PropTypes.object
  };

  constructor(props) {
    super(props);
    const { accounts, selectedGroup } = props;

    this.state = {
      selectedGroup: selectedGroup || {},
      accounts
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedGroup: nextProps.selectedGroup });
  }

  selectGroup = grp => {
    return () => this.setState({ selectedGroup: grp });
  };

  selectedClass = grp => {
    if (grp._id === this.state.selectedGroup._id) {
      return "selected";
    }
    return "";
  };

  renderGroups() {
    return (
      <List>
        {this.props.groups.map((grp, index) => (
          <div key={index} className={this.selectedClass(grp)}>
            <ListItem actionType="arrow" label={grp.name} onClick={this.selectGroup(grp)} />
          </div>
        ))}
      </List>
    );
  }

  render() {
    return (
      <div className="edit-group-container">
        <Card expanded={true}>
          <CardHeader
            actAsExpander={true}
            data-i18n="accountsUI.info.editGroups"
            title="Edit Groups"
          />
          <CardBody expandable={true}>
            <div className="settings">
              {this.renderGroups()}
              <PermissionsList
                permissions={groupPermissions(this.props.packages)}
                group={this.state.selectedGroup}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

const composer = (props, onData) => {
  const pkg = Meteor.subscribe("Packages", Reaction.getShopId());
  if (pkg.ready()) {
    const packages = Packages.find().fetch();
    onData(null, { packages, ...props });
  }
};

export default composeWithTracker(composer)(EditGroupContainer);

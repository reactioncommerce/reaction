import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import React, { Component } from "react";
import { Packages } from "/lib/collections";
import PropTypes from "prop-types";
import { composeWithTracker } from "/lib/api/compose";
import { List, ListItem, Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";
import PermissionsList from "../components/permissionsList";
import { groupPackages } from "../helpers/accountsHelper";

class EditGroupContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array,
    packages: PropTypes.array
  }

  constructor(props) {
    super(props);
    const { accounts, packages } = props;
    this.state = {
      accounts,
      packages
    };
  }

  renderGroups() {
    return (
      <div>
        <List>
          {this.props.groups.map((grp, index) => (
            <ListItem
              key={index}
              actionType="arrow"
              label={grp.name}
              onClick={function e() {}}
            />
          ))}
        </List>
      </div>
    );
  }

  render() {
    return (
      <div className="edit-group-container">
        <Card expanded={false}>
          <CardHeader actAsExpander={true} data-i18n="accountsUI.info.editGroups" title="Edit Groups" />
          <CardBody expandable={true}>
            <div className="settings">
              {this.renderGroups()}
              <PermissionsList packages={groupPackages(this.state.packages)}/>
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

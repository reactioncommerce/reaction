import { Meteor } from "meteor/meteor";
import _ from "lodash";
import { Reaction } from "/client/api";
import React, { Component } from "react";
import { Packages } from "/lib/collections";
import PropTypes from "prop-types";
import { composeWithTracker } from "/lib/api/compose";
import { List, ListItem, Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";
import PermissionsList from "../components/permissionsList";

class EditGroupContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array,
    packages: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      accounts: props.accounts
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
      <Card expanded={true}>
        <CardHeader actAsExpander={true} data-i18n="accountsUI.info.editGroups" title="Edit Groups" />
        <CardBody expandable={true}>
          <div className="settings">
            {this.renderGroups()}
            <PermissionsList packages={groupPackages(this.props.packages)}/>
          </div>
        </CardBody>
      </Card>
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

function groupPackages(packages) {
  return packages.map(pkg => {
    const permissions = [];
    if (pkg.registry && pkg.enabled) {
      for (const registryItem of pkg.registry) {
        // Skip entires with missing routes
        if (!registryItem.route) {
          continue;
        }

        // Get all permissions, add them to an array
        if (registryItem.permissions) {
          for (const permission of registryItem.permissions) {
            // check needed because of non-object perms in the permissions array (e.g "admin", "owner")
            if (typeof permission === "object") {
              permission.shopId = Reaction.getShopId();
              permissions.push(permission);
            }
          }
        }

        // Also create an object map of those same permissions as above
        const permissionMap = getPermissionMap(permissions);
        if (!permissionMap[registryItem.route]) {
          permissions.push({
            shopId: pkg.shopId,
            permission: registryItem.name || pkg.name + "/" + registryItem.template, // launchdock-connect/connectDashboard
            icon: registryItem.icon,
            label: registryItem.label || registryItem.provides || registryItem.route
          });
        }
      }
      // TODO review this, hardcoded WIP
      const label = pkg.name.replace("reaction", "").replace(/(-.)/g, x => " " + x[1].toUpperCase());

      return {
        shopId: pkg.shopId,
        icon: pkg.icon,
        name: pkg.name,
        label: label,
        permissions: _.uniq(permissions)
      };
    }
  });
}

function getPermissionMap(permissions) {
  const permissionMap = {};
  _.each(permissions, function(existing) {
    permissionMap[existing.permission] = existing.label;
  });
  return permissionMap;
}

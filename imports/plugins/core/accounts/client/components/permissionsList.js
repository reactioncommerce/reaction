import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { ListItem } from "/imports/plugins/core/ui/client/components";

class PermissionsList extends Component {
  static propTypes = {
    createGroup: PropTypes.func,
    group: PropTypes.object,
    permissions: PropTypes.array,
    updateGroup: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      group: props.group
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ group: nextProps.group });
  }

  togglePermission = toggledPermission => {
    return (event, checked) => {
      let newGroup = false;
      const groupData = Object.assign({}, this.state.group);
      if (!this.state.group._id) {
        newGroup = true;
        groupData.permissions = [];
      }
      const permissions = resolvePermissions(toggledPermission);

      if (checked) {
        groupData.permissions = _.uniq([...groupData.permissions, ...permissions]);
      } else {
        groupData.permissions = removePermissions(groupData.permissions, permissions);
      }

      if (newGroup && this.props.createGroup) {
        return this.props.createGroup(groupData);
      }

      if (this.props.updateGroup) {
        this.props.updateGroup(this.state.group._id, groupData);
      }
    };
  };

  checked = permission => {
    if (_.includes(this.state.group.permissions, permission)) {
      return true;
    }
    return false;
  };

  renderSubPermissions(permission) {
    if (permission.permissions.length) {
      return permission.permissions.map((childPermission, index) => {
        return (
          <ListItem
            key={`${childPermission.name}-${index + 1}`}
            actionType="switch"
            label={childPermission.label}
            switchOn={this.checked(childPermission.permission)}
            switchName={childPermission.permission}
            onSwitchChange={this.togglePermission(childPermission)}
          />
        );
      });
    }
    return null;
  }

  renderPermissions(permissions) {
    const jsx = [];
    permissions.forEach((permission, key) => {
      jsx.push(
        <div key={`${permission.name}-${key}`}>
          <ListItem
            label={permission.label}
            actionType="switch"
            switchOn={this.checked(permission.name)}
            switchName={permission.name}
            onSwitchChange={this.togglePermission(permission)}
          />
          {this.renderSubPermissions(permission)}
        </div>
      );
    });
    return jsx;
  }

  render() {
    return (
      <div>
        {this.renderPermissions(_.compact(this.props.permissions))}
      </div>
    );
  }
}

export default PermissionsList;

/**
 * resolvePermissions
 * @summary helper to resolve toggled permission(s).
 * It returns list of all parent and child permissions when a parent permission is toggled.
 * @param {Object} permission - a permission object from toggle list
 * @return {Array} -
 */
function resolvePermissions(permission) {
  const result = [];

  if (permission.name) {
    result.push(permission.name);
  }

  if (permission.permissions && permission.permissions.length) {
    for (const pkgPermissions of permission.permissions) {
      result.push(pkgPermissions.permission);
    }
  }

  return result;
}
// helper to remove all array items in "old" from "current"
function removePermissions(current, old) {
  const currentArray = [...current];

  old.forEach(val => {
    _.remove(currentArray, item => item === val);
  });
  return currentArray;
}

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

// resolvePermissions - helper to resolve toggled permission(s).
// It returns a list of all parent and child permissions when a parent permission is toggled.
function resolvePermissions(permission) {
  const result = [];

  if (permission.name) {
    result.push(permission.name);
    for (const pkgPermissions of permission.permissions) {
      result.push(pkgPermissions.permission);
    }
  } else {
    result.push(permission.permission);
  }

  return result;
}
// helper to remove all array items in "old" from "current"
function removePermissions(current, old) {
  const currentArray = [...current];

  old.forEach((val) => {
    _.remove(currentArray, (item) => item === val);
  });
  return currentArray;
}

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

  togglePermission = (toggledPermission) => (event, checked) => {
    const groupData = Object.assign({}, this.state.group);
    const permissions = resolvePermissions(toggledPermission);
    if (!groupData.permissions) {
      groupData.permissions = [];
    }
    if (checked) {
      groupData.permissions = _.uniq([...groupData.permissions, ...permissions]);
    } else {
      groupData.permissions = removePermissions(groupData.permissions, permissions);
    }

    if (this.props.updateGroup) {
      return this.props.updateGroup(this.state.group._id, groupData);
    }
  };

  checked = (permission) => {
    if (_.includes(this.state.group.permissions, permission)) {
      return true;
    }
    return false;
  };

  renderSubPermissions(permission) {
    if (permission.permissions.length) {
      return (
        <div className="child-item">
          {permission.permissions.map((childPermission, index) => (
            <Components.ListItem
              key={`${childPermission.name}-${index}`}
              actionType="switch"
              label={childPermission.label}
              switchOn={this.checked(childPermission.permission)}
              switchName={childPermission.permission}
              onSwitchChange={this.togglePermission(childPermission)}
            />
          ))}
        </div>
      );
    }
    return null;
  }

  renderPermissions(permissions) {
    const jsx = [];
    permissions.forEach((permission, key) => {
      jsx.push(<div className="permission-item" key={`${permission.name}-${key}`}>
        <Components.ListItem
          label={permission.label}
          actionType="switch"
          switchOn={this.checked(permission.name)}
          switchName={permission.name}
          onSwitchChange={this.togglePermission(permission)}
        />
        {this.renderSubPermissions(permission)}
      </div>);
    });
    return jsx;
  }

  render() {
    return (
      <div className="permissions-list">
        {this.renderPermissions(_.compact(this.props.permissions))}
      </div>
    );
  }
}

registerComponent("PermissionsList", PermissionsList);

export default PermissionsList;

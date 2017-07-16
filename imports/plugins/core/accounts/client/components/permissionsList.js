import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { ListItem } from "/imports/plugins/core/ui/client/components";

class PermissionsList extends Component {
  static propTypes = {
    group: PropTypes.object,
    permissions: PropTypes.array
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
            onSwitchChange={(e, a) => {
              console.log({ e, a });
            }}
          />
        );
      });
    }
    return null;
  }

  checked = permission => {
    console.log(permission);
    if (_.includes(this.state.group.permissions, permission)) {
      return true;
    }
    return false;
  };

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
            onSwitchChange={(e, a) => {
              console.log({ e, a });
            }}
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

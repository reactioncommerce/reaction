import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, FlatButton, Switch } from "/imports/plugins/core/ui/client/components";

class EditGroup extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    getGroupPermissions: PropTypes.func,
    groups: PropTypes.object,
    hasPermissionChecked: PropTypes.func,
    toggleGroupPermission: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      shopManagers: props.groups.shopManager
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  hasManyPermissions(permissions) {
    return Boolean(permissions.length);
  }

  checked(permissions, group) {
    return this.props.hasPermissionChecked(permissions, group);
  }

  handleToggle(e, permissionGroup, groupData) {
    e.preventDefault();
    return this.props.toggleGroupPermission(permissionGroup, groupData);
  }

  renderShopManagers() {
    // console.log("groups", this.props.groups);
    return (
      <div>{Object.keys(this.props.groups).map((item, index) =>
        <Card
          expanded={true}
          key={index}
        >
          <CardHeader title={item} actAsExpander={true}/>
          <CardBody expandable={true}>
            <div className="settings-list">
              {index === 0 ?
                <div className="rui card-toolbar groups-switch">
                  <Switch
                    checked
                    onChange={function e() {}}
                  />
                  <span>Default</span>
                  <FlatButton
                    i18nKeyLabel={"admin.i18nSettings.allOn"}
                    label="All On"
                    value={name}
                    onClick={this.handleAllOn}
                  />
                  { "|" }
                  <FlatButton
                    i18nKeyLabel={"admin.i18nSettings.allOff"}
                    label="All Off"
                    value={name}
                    onClick={this.handleAllOff}
                  />
                </div> : ""
              }
              {this.renderGroupSettings(this.props.groups[item])}
            </div>
          </CardBody>
        </Card>
      )
      }
      </div>
    );
  }

  renderGroupSettings(group) {
    const { getGroupPermissions } = this.props;
    return (
      <div className="group-permission toggles">
        {getGroupPermissions(group.groupData.group.shopId).map((item, index) =>
          <div className="rui card-toolbar toggle-switch" key={index}>
            {!this.hasManyPermissions(item.permissions) ?
              <div className="" data-event-action="expandPermission">
                <div className="toggle-label">
                  <label>
                    {item.label}
                  </label>
                </div>
                <div className="toggle-switch">
                  <Switch
                    checked={this.checked(item.permissions, group)}
                    data-groupId={group.groupData.group.shopId}
                    data-permissions={item.permissions}
                    onChange={(e) => this.handleToggle(e, item, group)}
                  />
                </div>
              </div>
              :
              // TODO:  need to effect hasManyPermissions ?
              <div className="" data-event-action="expandPermission" key={index}>
                <div className="toggle-label">
                  <label>
                    {item.label}
                  </label>
                </div>
                <div className="toggle-switch">
                  <Switch
                    checked={this.checked(item.permissions, group)}
                    data-groupId={group.groupData.group.shopId}
                    data-permissions={item.permissions}
                    onChange={(e) => this.handleToggle(e, item, group)}
                  />
                </div>
              </div>
            }
          </div>
        )}
      </div>
    );
  }

  renderGroupsList() {
    return (
      <div>
        {this.renderShopManagers()}
      </div>
    );
  }

  render() {
    return (
      <Card expanded={true}>
        <CardHeader actAsExpander={true} data-i18n="accountsUI.info.editGroups" title="Edit Groups" />
        <CardBody expandable={true}>
          <div className="settings">
            {this.renderGroupsList()}
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default EditGroup;

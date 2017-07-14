import React, { Component } from "react";
import PropTypes from "prop-types";
import { List, ListItem, Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";

class EditGroup extends Component {
  static propTypes = {
    groups: PropTypes.array
  }

  hasManyPermissions(permissions) {
    return Boolean(permissions.length);
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

  renderGroupsList() {
    return (
      <div>
        {this.renderGroups()}
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

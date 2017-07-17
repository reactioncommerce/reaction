import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { List, ListItem, Card, CardHeader, CardBody } from "/imports/plugins/core/ui/client/components";
import PermissionsList from "../components/permissionsList";
import GroupForm from "../components/groupForm";
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
      newGroup: null,
      isCreating: false,
      accounts
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedGroup: nextProps.selectedGroup });
  }

  selectGroup = grp => {
    return event => {
      event.preventDefault();
      this.setState({ selectedGroup: grp, isCreating: false });
    };
  };

  groupListClass = grp => {
    return classnames({
      "groups-item-selected": grp._id === this.state.selectedGroup._id,
      "groups-list": true
    });
  };

  onGroupFormChange = formData => {
    const grp = Object.assign({}, this.state.selectedGroup, formData);
    this.setState({ selectedGroup: grp });
  };

  createGroup = groupData => {
    Meteor.call("group/createGroup", groupData, Reaction.getShopId(), err => {
      if (err) {
        return Alerts.toast(i18next.t("Error creating group"), "error");
      }
      Alerts.toast(i18next.t("Success creating group"), "success");
    });
  };

  updateGroup = (groupId, groupData) => {
    Meteor.call("group/updateGroup", groupId, groupData, Reaction.getShopId(), err => {
      if (err) {
        return Alerts.toast(i18next.t("Update failed."), "error"); // TODO: Change to <Alert>
      }
      this.setState({ selectedGroup: groupData });
      Alerts.toast(i18next.t("Group updated"), "success"); // TODO: Change to <Alert>
    });
  };

  renderGroupForm = () => {
    if (this.state.isCreating) {
      return (
        <GroupForm
          group={this.state.selectedGroup}
          onChange={this.onGroupFormChange}
          saveGroup={this.onGroupFormBlur}
        />
      );
    }
    return null;
  };

  showForm = (grp = {}) => {
    return e => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isCreating: true, selectedGroup: grp });
    };
  };

  renderGroups() {
    return (
      <List>
        {this.props.groups.map((grp, index) => (
          <div key={index} className={this.groupListClass(grp)}>
            <ListItem label={grp.name} onClick={this.selectGroup(grp)}>
              <a href="" onClick={this.showForm(grp)} className="fa fa-pencil" />
            </ListItem>
          </div>
        ))}
        <ListItem label="New Group" onClick={this.showForm()}>
          <i className="fa fa-plus" />
        </ListItem>
      </List>
    );
  }

  render() {
    return (
      <div className="edit-group-container">
        <Card expanded={true}>
          <CardHeader actAsExpander={true} data-i18n="accountsUI.info.editGroups" title="Edit Groups" />
          <CardBody expandable={true}>
            <div className="settings">
              {this.renderGroups()}
              {this.renderGroupForm()}
              <PermissionsList
                permissions={groupPermissions(this.props.packages)}
                group={this.state.selectedGroup}
                createGroup={this.createGroup}
                updateGroup={this.updateGroup}
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

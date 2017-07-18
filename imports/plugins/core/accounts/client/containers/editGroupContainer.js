import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import {
  List,
  ListItem,
  Card,
  CardHeader,
  CardBody,
  Alerts
} from "/imports/plugins/core/ui/client/components";
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
    const { accounts, selectedGroup, groups } = props;

    this.state = {
      alertArray: [],
      selectedGroup: selectedGroup || {},
      newGroup: null,
      isCreating: false,
      groups,
      accounts
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroup } = nextProps;
    this.setState({ selectedGroup, isCreating: false });
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
      let newAlert;
      if (err) {
        newAlert = {
          message: err,
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "accountsUI.info.errorSendingEmail" }
        };
        return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
      }
      newAlert = {
        mode: "success",
        options: { autoHide: 4000, i18nKey: "admin.groups.successCreate" }
      };
      return this.setState({
        groups: [...this.state.groups, groupData],
        selectedGroup: groupData,
        isCreating: false,
        alertArray: [...this.state.alertArray, newAlert]
      });
    });
  };

  updateGroup = (groupId, groupData) => {
    Meteor.call("group/updateGroup", groupId, groupData, Reaction.getShopId(), err => {
      let newAlert;
      if (err) {
        newAlert = {
          message: err,
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "admin.groups.errorUpdate" }
        };
        return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
      }
      newAlert = {
        mode: "success",
        options: { autoHide: 4000, i18nKey: "admin.groups.successUpdate" }
      };
      this.setState({ selectedGroup: groupData, alertArray: [...this.state.alertArray, newAlert] });
    });
  };

  showForm = (grp = {}) => {
    return e => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isCreating: true, selectedGroup: grp });
    };
  };

  renderGroupForm = () => {
    if (this.state.isCreating) {
      return <GroupForm group={this.state.selectedGroup} onChange={this.onGroupFormChange} />;
    }
    return null;
  };

  renderGroups() {
    return (
      <List>
        {this.state.groups.map((grp, index) => (
          <div key={index} className={this.groupListClass(grp)}>
            <ListItem label={grp.name} onClick={this.selectGroup(grp)}>
              <a href="" onClick={this.showForm(grp)} className="fa fa-pencil" />
            </ListItem>
          </div>
        ))}
        <ListItem label="New Group" i18nKeyLabel="admin.groups.newGroup" onClick={this.showForm()}>
          <i className="fa fa-plus" />
        </ListItem>
      </List>
    );
  }

  render() {
    return (
      <div className="edit-group-container">
        <Card expanded={true}>
          <CardHeader actAsExpander={true} i18nKeyTitle="admin.groups.editGroups" title="Edit Groups" />
          <CardBody expandable={true}>
            <div className="settings">
              <Alerts alerts={this.state.alertArray} />
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

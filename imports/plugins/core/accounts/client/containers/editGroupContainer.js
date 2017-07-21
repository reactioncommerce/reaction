import { Meteor } from "meteor/meteor";
import _ from "lodash";
import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { List, ListItem, Card, CardHeader, CardBody, Alerts } from "@reactioncommerce/reaction-ui";
import PermissionsList from "../components/permissionsList";
import GroupForm from "../components/groupForm";
import { groupPermissions } from "../helpers/accountsHelper";

class EditGroupContainer extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.array,
    onChangeGroup: PropTypes.func,
    packages: PropTypes.array,
    selectedGroup: PropTypes.object
  };

  constructor(props) {
    super(props);
    const { accounts, selectedGroup, groups } = props;

    this.state = {
      alertArray: [],
      selectedGroup: selectedGroup || {},
      isEditing: false,
      groups,
      accounts
    };
  }

  componentWillReceiveProps(nextProps) {
    const { groups, selectedGroup } = nextProps;
    this.setState({ groups, selectedGroup });
  }

  selectGroup = (grp) => {
    return (event) => {
      event.preventDefault();
      if (this.props.onChangeGroup) {
        this.props.onChangeGroup(grp);
      }
      this.setState({ isEditing: false });
    };
  };

  groupListClass = (grp) => {
    return classnames({
      "groups-item-selected": grp._id === this.state.selectedGroup._id,
      "groups-list": true
    });
  };

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  createGroup = (groupData) => {
    Meteor.call("group/createGroup", groupData, Reaction.getShopId(), (err, res) => {
      let newAlert;
      if (err) {
        newAlert = {
          message: err.reason,
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "accountsUI.info.errorSendingEmail" }
        };
        return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
      }
      newAlert = {
        mode: "success",
        options: { autoHide: 4000, i18nKey: "admin.groups.successCreate" }
      };

      if (this.props.onChangeGroup) {
        this.props.onChangeGroup(res.group);
      }

      return this.setState({
        isEditing: false,
        alertArray: [...this.state.alertArray, newAlert]
      });
    });
  };

  updateGroup = (groupId, groupData) => {
    Meteor.call("group/updateGroup", groupId, groupData, Reaction.getShopId(), (err, res) => {
      let newAlert;
      if (err) {
        newAlert = {
          message: err.reason,
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "admin.groups.errorUpdate" }
        };
        return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
      }
      newAlert = {
        mode: "success",
        options: { autoHide: 4000, i18nKey: "admin.groups.successUpdate" }
      };

      if (this.props.onChangeGroup) {
        this.props.onChangeGroup(res.group);
      }

      this.setState({
        isEditing: false,
        alertArray: [...this.state.alertArray, newAlert]
      });
    });
  };

  showForm = ((grp) = {}) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isEditing: true, selectedGroup: grp });
    };
  };

  renderGroupForm = () => {
    if (!this.state.isEditing) {
      return null;
    }
    if (_.isEmpty(this.state.selectedGroup)) {
      return (
        <GroupForm
          submitLabel="Create Group"
          group={this.state.selectedGroup}
          createGroup={this.createGroup}
        />
      );
    }
    return (
      <GroupForm
        className="update-form"
        submitLabel="Update Group"
        group={this.state.selectedGroup}
        updateGroup={this.updateGroup}
      />
    );
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

  renderPermissionsList = () => {
    if (this.state.isEditing) {
      return null;
    }
    return (
      <PermissionsList
        permissions={groupPermissions(this.props.packages)}
        group={this.state.selectedGroup}
        updateGroup={this.updateGroup}
      />
    );
  };

  render() {
    return (
      <div className="edit-group-container">
        <Card expanded={true}>
          <CardHeader actAsExpander={true} i18nKeyTitle="admin.groups.editGroups" title="Edit Groups" />
          <CardBody expandable={true}>
            <div className="settings">
              <Alerts alerts={this.state.alertArray} onAlertRemove={this.removeAlert} />
              {this.renderGroups()}
              {this.renderGroupForm()}
              {this.renderPermissionsList()}
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

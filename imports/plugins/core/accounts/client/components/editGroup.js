import { Meteor } from "meteor/meteor";
import _ from "lodash";
import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import ReactionAlerts from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";
import { Reaction, i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import { groupPermissions } from "../helpers/accountsHelper";

class EditGroup extends Component {
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
    const alertId = "edit-group-comp";

    this.state = {
      alertOptions: { placement: alertId, id: alertId, autoHide: 4000 },
      selectedGroup: selectedGroup || {},
      isEditing: false,
      groups,
      accounts
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { groups, selectedGroup } = nextProps;
    this.setState({ groups, selectedGroup: selectedGroup || {} });
  }

  selectGroup = (grp) => (event) => {
    event.preventDefault();
    if (this.props.onChangeGroup) {
      this.props.onChangeGroup(grp);
    }
    this.setState({ isEditing: false });
  };

  groupListClass = (grp) => classnames({
    "groups-item-selected": grp._id === this.state.selectedGroup._id,
    "groups-list": true
  });

  removeAlert = (oldAlert) => this.setState({
    alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
  });

  createGroup = (groupData) => {
    Meteor.call("group/createGroup", groupData, Reaction.getShopId(), (err, res) => {
      if (err) {
        return ReactionAlerts.add(
          err.reason,
          "danger",
          Object.assign({}, this.state.alertOptions, { i18nKey: "admin.settings.createGroupError" })
        );
      }

      if (this.props.onChangeGroup) {
        this.props.onChangeGroup(res.group);
      }

      ReactionAlerts.add(
        "Created successfully",
        "success",
        Object.assign({}, this.state.alertOptions, { i18nKey: "admin.settings.createGroupSuccess" })
      );

      return this.setState({ isEditing: false });
    });
  };

  updateGroup = (groupId, groupData) => {
    Meteor.call("group/updateGroup", groupId, groupData, Reaction.getShopId(), (err, res) => {
      if (err) {
        return ReactionAlerts.add(
          err.reason,
          "danger",
          Object.assign({}, this.state.alertOptions, { i18nKey: "admin.settings.updateGroupError" })
        );
      }

      if (this.props.onChangeGroup) {
        this.props.onChangeGroup(res.group);
      }

      ReactionAlerts.add(
        "Created successfully",
        "success",
        Object.assign({}, this.state.alertOptions, { i18nKey: "admin.settings.updateGroupSuccess" })
      );

      return this.setState({ isEditing: false });
    });
  };

  showForm = ((grp) = {}) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ isEditing: true, selectedGroup: grp });
  };

  renderGroupForm = () => {
    if (!this.state.isEditing) {
      return null;
    }
    if (_.isEmpty(this.state.selectedGroup)) {
      return (
        <Components.GroupForm
          submitLabel="Create Group"
          i18nKeyLabel="admin.groups.create"
          group={this.state.selectedGroup}
          createGroup={this.createGroup}
        />
      );
    }
    return (
      <Components.GroupForm
        className="update-form"
        submitLabel="Update Group"
        i18nKeyLabel="admin.groups.update"
        group={this.state.selectedGroup}
        updateGroup={this.updateGroup}
      />
    );
  };

  renderGroups() {
    return (
      <Components.List>
        {this.state.groups.map((grp, index) => (
          <div key={index} className={this.groupListClass(grp)}>
            <Components.ListItem label={grp.name} onClick={this.selectGroup(grp)} listItemClassName="flex flex-justify-spaceBetween">
              <Components.IconButton
                icon="fa fa-pencil"
                onClick={this.showForm(grp)}
              />
            </Components.ListItem>
          </div>
        ))}
        <Components.ListItem label="New Group" i18nKeyLabel="admin.groups.newGroup" onClick={this.showForm()}>
          <i className="fa fa-plus" />
        </Components.ListItem>
      </Components.List>
    );
  }

  renderPermissionsList = () => {
    if (this.state.isEditing) {
      return null;
    }
    return (
      <Components.PermissionsList
        permissions={groupPermissions(this.props.packages)}
        group={this.state.selectedGroup}
        updateGroup={this.updateGroup}
      />
    );
  };

  render() {
    const alertId = this.state.alertOptions.id;
    return (
      <div className="edit-group-container">
        <Card elevation={0}>
          <CardHeader title={i18next.t("admin.groups.editGroups", { defaultValue: "Edit Groups" })} />
          <CardContent>
            <div className="settings">
              <Components.Alerts placement={alertId} id={alertId} onAlertRemove={this.removeAlert} />
              {this.renderGroups()}
              {this.renderGroupForm()}
              {this.renderPermissionsList()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default EditGroup;

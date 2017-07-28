import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import { getGravatar } from "../helpers/accountsHelper";

class AddGroupMembers extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    alertArray: PropTypes.array,
    group: PropTypes.object,
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      alertArray: [],
      selected: null,
      accounts: props.accounts,
      group: props.group,
      groups: props.groups
    };
  }

  componentWillReceiveProps(nextProps) {
    const { group, groups, accounts } = nextProps;
    this.setState({ group, groups, accounts });
  }

  isInGroup(acc) {
    const currentUserGroup = this.props.groups.find((grp) => {
      if (!acc.groups) {
        return false;
      }
      return acc.groups[0] === grp._id;
    });
    if (!currentUserGroup) {
      return false;
    }
    return currentUserGroup._id === this.props.group._id;
  }

  getCursorClass(acc) {
    return this.isInGroup(acc) ? "c-default" : "";
  }

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  handleMouseOver(acc) {
    return () => {
      this.setState({ selected: acc });
    };
  }

  handleMouseOut(acc) {
    return () => {
      if (this.state.selected === acc) {
        this.setState({ selected: null });
      }
    };
  }

  handleOnGroupChange(acc) {
    return () => {
      if (this.isInGroup(acc)) {
        return false; // already in group; nothing to change
      }
      Meteor.call("group/addUser", acc._id, this.props.group._id, (err) => {
        let newAlert;
        if (err) {
          newAlert = {
            message: err.reason,
            mode: "danger",
            options: { autoHide: 4000, i18nKey: "admin.groups.addUserError" }
          };
          return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
        }
        newAlert = {
          mode: "success",
          options: { autoHide: 4000, i18nKey: "admin.groups.addUserSuccess" }
        };
        return this.setState({ alertArray: [...this.state.alertArray, newAlert] });
      });
    };
  }

  renderBadge(acc) {
    const currentUserGroup = this.props.groups.find((grp) => {
      if (!acc.groups) {
        return false;
      }
      return acc.groups[0] === grp._id;
    });
    if (!currentUserGroup) {
      return null;
    }
    const isNotInGroup = currentUserGroup._id !== this.props.group._id;
    const isSelected = acc === this.state.selected;
    if (isSelected && isNotInGroup) {
      return <span>Make {this.props.group.name}</span>;
    }
    return <span>{currentUserGroup.name}</span>;
  }

  getCellElements(data, columnName) {
    const acc = data.value;
    if (columnName === "name") {
      return (
        <a
          className={this.getCursorClass(acc)}
          onMouseOver={this.handleMouseOver(acc)}
          onMouseOut={this.handleMouseOut(acc)}
          onClick={this.handleOnGroupChange(acc)}
        >
          <div className="name-box">
            <img className="accounts-img-tag" src={getGravatar(acc)} />
            <span>
              <span className="title"><b>{acc.name}</b></span>
              <span>{_.get(acc, "emails[0].address")}</span>
            </span>
          </div>
        </a>
      );
    }

    if (columnName === "group") {
      return (
        <a
          className={`badge ${this.getCursorClass(acc)}`}
          onMouseOver={this.handleMouseOver(acc)}
          onMouseOut={this.handleMouseOut(acc)}
          onClick={this.handleOnGroupChange(acc)}
        >
          {this.renderBadge(acc)}
        </a>
      );
    }
  }

  render() {
    const fields = ["name", "group"];
    const tableData = fields.map((columnName) => ({
      Header: columnName,
      accessor: "", // sends whole object
      Cell: (data) => {
        return this.getCellElements(data, columnName);
      }
    }));
    return (
      <div className="add-group-members">
        <Components.Alerts alerts={this.state.alertArray} onAlertRemove={this.removeAlert} />
        <Components.Card expanded={true}>
          <Components.CardHeader actAsExpander={true} title={this.state.group.name} />
          <Components.CardBody expandable={true}>
            <SortableTable
              tableClassName="accounts-group-table"
              data={this.state.accounts}
              columnMetadata={tableData}
              filteredFields={fields}
              filterType="none"
              showFilter={true}
            />
          </Components.CardBody>
        </Components.Card>
      </div>
    );
  }
}

registerComponent("AddGroupMembers", AddGroupMembers);

export default AddGroupMembers;

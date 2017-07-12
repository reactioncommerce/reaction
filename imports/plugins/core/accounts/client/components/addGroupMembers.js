import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";
import * as Collections from "/lib/collections";
import { getGravatar } from "../helpers/accountsHelper";


class AddGroupMembers extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    groups: PropTypes.object
  }

  constructor() {
    super();
  }

  renderUserList(accounts) {
    const filteredFields = {
      Name: "name",
      Group: "groups[0]"
    };

    const columnMetadata = [];
    const allColumns = ["Name", "Group"];
    allColumns.forEach((columnName) => {
      const columnMeta = {
        Header: columnName,
        accessor: filteredFields[columnName],
        headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
        Cell: row => {
          if (columnName === "Name" && row.original.groups.length > 0) {
            return (
              <div>
                <span><img className="circular-icon accounts-field-profile img-cell" src={getGravatar(row.original)}/></span>
                <span><strong>{row.value}</strong></span>
              </div>
            );
          }
          if (columnName === "Group" && row.original.groups.length > 0) {
            return (
              <div>
                <span><strong>{this.getGroupName(row.value)}</strong></span>
              </div>
            );
          }
        }
      };
      columnMetadata.push(columnMeta);
    });


    return (
      <SortableTable
        tableClassName="owner-table"
        data={accounts}
        columnMetadata={columnMetadata}
        filteredFields={allColumns}
        showFilter={true}
        isFilterable={true}
      />
    );
  }

  renderOwner() {
    return (
      <div className="group-owner header">
        <label>
          { /* item.label */ }
        </label>
      </div>
    );
  }

  getGroupName(groupId) {
    return Collections.Groups.findOne({ _id: groupId }).name;
  }

  render() {
    return (
      <Card
        expanded={true}
      >
        <CardHeader
          actAsExpander={true}
          data-i18n="accountsUI.info.addAdminUser"
          title="Owner"
          id="accounts"
        />
        <CardBody expandable={true}>
          {this.renderUserList(this.props.accounts)}
        </CardBody>
      </Card>
    );
  }
}

export default AddGroupMembers;

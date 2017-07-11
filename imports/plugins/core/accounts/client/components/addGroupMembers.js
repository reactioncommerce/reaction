import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";
import * as Collections from "/lib/collections";


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
                <div className="" style={{}}>
                  <span><img className="circular-icon accounts-field-profile" style={{ borderRadius: "50%" }} src={this.getGravatar(row.original)}/></span>
                  <span style={{}}><strong>{row.value}</strong></span>
                </div>
            );
          }
          if (columnName === "Group" && row.original.groups.length > 0) {
            return (
                <div className="" style={{}}>
                  <span style={{}}><strong>{this.getGroupName(row.value)}</strong></span>
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
        <div className="" style={{ float: "left", height: "37px", position: "relative", right: "120px", top: "5px", width: "200px", fontSize: "16px" }}>
            <label>
            {item.label}
            </label>
        </div>
    );
  }

  getGravatar(user) {
    const options = {
      secure: true,
      size: 30,
      default: "identicon"
    };
    if (!user) { return false; }
    const account = Collections.Accounts.findOne(user._id);
    if (account && account.profile && account.profile.picture) {
      return account.profile.picture;
    }
    if (user.emails && user.emails.length > 0) {
      const email = user.emails[0].address;
      return Gravatar.imageUrl(email, options);
    }
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

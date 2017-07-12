import React, { Component } from "react";
import PropTypes from "prop-types";
import { Checkbox, Icon } from "/imports/plugins/core/ui/client/components";
import { Card, CardHeader, CardBody, SortableTable } from "/imports/plugins/core/ui/client/components";
import AccountsTableCell from "./accountsTableCell";

// TODO: Move from here and set as constants
const fieldPath = {
  name: "name",
  email: "emails[0].address",
  createdAt: "createdAt",
  twoFactor: "profile.invited",
  dropdown: "",
  button: ""
};

class AccountsTable extends Component {
  static propTypes = {
    group: PropTypes.object,
    headerLabel: PropTypes.string,
    i18nKeyLabel: PropTypes.string
  };

  renderTable(users) {
    const columnMetadata = [];

    Object.keys(fieldPath).forEach(columnName => {
      const columnMeta = {
        Header: this.getHeader(columnName),
        accessor: fieldPath[columnName],
        headerClass: { backgroundColor: "#f5f5f5", display: "flex" },
        Cell: data => {
          return <AccountsTableCell data={data} columnName={columnName} {...this.props} />;
        }
      };
      columnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        tableClassName="-accounts"
        data={users}
        columnMetadata={columnMetadata}
        filteredFields={Object.keys(fieldPath)}
        filterType="none"
        showFilter={true}
      />
    );
  }
  getHeader(headerName) {
    if (headerName === "name") {
      return (
        <div className="table-cell header">
          <span className="name-cell"><Checkbox /> </span>
          <span className="name-cell"> Name </span>
          <span className="name-icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "email") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Email </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "createdAt") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Last Active </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
    if (headerName === "twoFactor") {
      return (
        <div className="table-cell header">
          <span className="content-cell">Two Factor </span>
          <span className="icon-cell">
            <Icon icon="chevron-down" />
          </span>
        </div>
      );
    }
  }

  render() {
    return (
      <Card expanded={true}>
        <CardHeader
          actAsExpander={true}
          i18nKeyTitle={this.props.headerLabel}
          title={this.props.headerLabel}
          id="accounts"
        />
        <CardBody expandable={true} id="accounts">
          {this.renderTable(this.props.group.users)}
        </CardBody>
      </Card>
    );
  }
}
export default AccountsTable;

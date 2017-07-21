import React, { Component } from "react";
import PropTypes from "prop-types";
import { Orders } from "/lib/collections";
import { SortableTable, Loading, Checkbox } from "@reactioncommerce/reaction-ui";
import OrderTableColumn from "./orderTableColumn";

const classNames = {
  colClassNames: {
    "Name": "order-table-column-name",
    "Email": "order-table-column-email hidden-xs hidden-sm",
    "Date": "order-table-column-date hidden-xs hidden-sm",
    "ID": "order-table-column-id hidden-xs",
    "Total": "order-table-column-total hidden-xs",
    "Shipping": "order-table-column-shipping hidden-xs hidden-sm",
    "Status": "order-table-column-status",
    "": "order-table-column-control"
  },
  headerClassNames: {
    "Name": "order-table-header-name",
    "Email": "order-table-header-email hidden-xs hidden-sm",
    "Date": "order-table-header-date hidden-xs hidden-sm",
    "ID": "order-table-header-id hidden-xs",
    "Total": "order-table-header-total hidden-xs",
    "Shipping": "order-table-header-shipping hidden-xs hidden-sm",
    "Status": "order-table-header-status",
    "": "order-table-header-control"
  }
};

class OrderTable extends Component {
  static propTypes = {
    fulfillmentBadgeStatus: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    multipleSelect: PropTypes.bool,
    orders: PropTypes.array,
    renderBulkOrderActionsBar: PropTypes.func,
    renderPaginationClassNameHidden: PropTypes.func,
    renderTableClassNameHidden: PropTypes.func,
    selectAllOrders: PropTypes.func,
    selectedItems: PropTypes.array,
    shippingBadgeStatus: PropTypes.func
  }

  render() {
    const filteredFields = {
      "Name": "shipping[0].address.fullName",
      "Email": "email",
      "Date": "createdAt",
      "ID": "_id",
      "Total": "billing[0].invoice.total",
      "Shipping": "shipping[0].workflow.status",
      "Status": "workflow.status",
      "": ""
    };

    const customColumnMetadata = [];
    const columnNames = Object.keys(filteredFields);

    // https://react-table.js.org/#/story/cell-renderers-custom-components
    columnNames.forEach((columnName) => {
      let colHeader = undefined;
      let resizable = true;
      let sortable = true;

      // Add custom styles for the column name `name`
      if (columnName === "Name") {
        colHeader = () => (
          <div className="order-table-name-cell">
            <Checkbox
              className="order-header-checkbox checkbox-large"
              checked={this.props.multipleSelect}
              name="orders-checkbox"
              onChange={() => this.props.selectAllOrders(this.props.orders, this.props.multipleSelect)}
            />
            <span style={{ marginTop: 10 }}>{columnName}</span>
          </div>
        );
      }

      if (columnName === "") {
        resizable = false;
        sortable = false;
      }

      const columnMeta = {
        accessor: filteredFields[columnName],
        Header: colHeader ? colHeader : columnName,
        headerClassName: classNames.headerClassNames[columnName],
        className: classNames.colClassNames[columnName],
        resizable: resizable,
        sortable: sortable,
        Cell: row => (
          <OrderTableColumn
            row={row}
            handleClick={this.props.handleClick}
            handleSelect={this.props.handleSelect}
            selectedItems={this.props.selectedItems}
            fulfillmentBadgeStatus={this.props.fulfillmentBadgeStatus}
            shippingBadgeStatus={this.props.shippingBadgeStatus}
          />
        )
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <div>
        {this.props.renderBulkOrderActionsBar()}
        <SortableTable
          tableClassName={`rui order table ${this.props.renderTableClassNameHidden()} -highlight`}
          publication="CustomPaginatedOrders"
          collection={Orders}
          matchingResultsCount="order-count"
          columnMetadata={customColumnMetadata}
          externalLoadingComponent={Loading}
          filterType="none"
          selectedRows={this.props.selectedItems}
          getTheadProps={() => {
            return {
              className: "order-table-thead"
            };
          }}
          getTrGroupProps={() => {
            return {
              className: "order-table-tr-group"
            };
          }}
          getPaginationProps={() => {
            return {
              className: this.props.renderPaginationClassNameHidden()
            };
          }}
          getTableProps={() => {
            return {
              className: "order-table-table"
            };
          }}
          showPaginationTop={true}
        />
      </div>
    );
  }
}

export default OrderTable;

import React, { Component } from "react";
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
  render() {
    const {
      orders, selectedItems, handleSelect,
      handleClick, multipleSelect, selectAllOrders,
      fulfillmentBadgeStatus, shippingBadgeStatus
    } = this.props;

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
      let colWidth = undefined;

      // Add custom styles for the column name `name`
      if (columnName === "Name") {
        colHeader = () => (
          <div className="order-table-name-cell">
            <Checkbox
              className="order-header-checkbox checkbox-large"
              checked={multipleSelect}
              name="orders-checkbox"
              onChange={() => selectAllOrders(orders, multipleSelect)}
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
        width: colWidth,
        resizable: resizable,
        sortable: sortable,
        Cell: row => (
          <OrderTableColumn
            row={row}
            handleClick={handleClick}
            handleSelect={handleSelect}
            selectedItems={selectedItems}
            fulfillmentBadgeStatus={fulfillmentBadgeStatus}
            shippingBadgeStatus={shippingBadgeStatus}
          />
        )
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        tableClassName="rui order table -highlight"
        publication="CustomPaginatedOrders"
        collection={Orders}
        matchingResultsCount="order-count"
        columnMetadata={customColumnMetadata}
        externalLoadingComponent={Loading}
        filterType="none"
        getTheadProps={() => {
          return {
            style: {
              borderTop: "1px solid #e6e6e6",
              borderRight: "1px solid #e6e6e6",
              borderLeft: "1px solid #e6e6e6"
            }
          };
        }}
        getTrGroupProps={() => {
          return {
            style: {
              borderRight: "1px solid #e6e6e6",
              borderLeft: "1px solid #e6e6e6"
            }
          };
        }}
        getTrProps={() => {
          return {
            style: {
              height: 49,
              maxHeight: 49
            }
          };
        }}
        getPaginationProps={() => {
          return {
            className: "order-table-pagination"
          };
        }}
        getTableProps={() => {
          return {
            style: {
              borderBottom: "1px solid #e6e6e6"
            }
          };
        }}
        showPaginationTop={true}
      />
    );
  }
}

export default OrderTable;

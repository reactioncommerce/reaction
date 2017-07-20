import React, { Component } from "react";
import { Orders } from "/lib/collections";
import { SortableTable, Loading, Checkbox } from "@reactioncommerce/reaction-ui";
import OrderTableColumn from "./orderTableColumn";

const classNames = {
  colClassNames: {
    Name: "order-table-column-name",
    Email: "order-table-column-email",
    Date: "order-table-column-date",
    ID: "order-table-column-id",
    Total: "order-table-column-total",
    Shipping: "order-table-column-shipping",
    Status: "order-table-column-status"
  },
  headerClassNames: {
    Name: "order-table-header-name",
    Email: "order-table-header-email",
    Date: "order-table-header-date",
    ID: "order-table-header-id",
    Total: "order-table-header-total",
    Shipping: "order-table-header-shipping",
    Status: "order-table-header-status"
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
      let className = undefined;
      let headerClassName = undefined;
      let colWidth = undefined;
      let resizable = true;
      let sortable = true;

      // Add custom styles for the column name `name`
      if (columnName === "Name") {
        colWidth = 250;
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

      if (columnName === "Date" || columnName === "Total" || columnName === "ID") {
        colWidth = 95;
      }

      if (columnName === "Shipping" || columnName === "Status") {
        colWidth = 150;
      }

      if (columnName === "Email" || columnName === "Date" || columnName === "Shipping") {
        className = "hidden-xs hidden-sm";
        headerClassName = "hidden-xs hidden-sm";
      }

      if (columnName === "ID" || columnName === "Total") {
        className = "hidden-xs";
        headerClassName = "hidden-xs";
      }

      if (columnName === "") {
        colWidth = 50;
        className = "controls";
        resizable = false;
        sortable = false;
        // colStyle = {
        //   padding: 0,
        //   height: 52
        // };
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
        getPaginationProps={() => {
          return {
            className: "orders-list-pagination"
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

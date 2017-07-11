import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { i18next } from "/client/api";

export default function ordersTable() {
  const columns = [
    {
      id: "_id",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.orderId", { defaultValue: "Order ID" }),
      renderer(cellData) { // eslint-disable-line react/no-multi-comp
        return <a data-event-action="goToOrder" data-event-data={cellData}>{cellData}</a>;
      }
    },
    {
      id: "shippingName",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingName", { defaultValue: "Name" }),
      value: rowData => {
        return rowData.shippingName;
      }
    },
    {
      id: "userEmail",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.userEmails", { defaultValue: "Email" }),
      value: rowData => {
        return rowData.userEmails[0];
      }
    },
    {
      id: "shippingAddress",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingAddress", { defaultValue: "Address" }),
      value: rowData => {
        return rowData.shippingAddress.address;
      }
    },
    {
      id: "shippingCity",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingCity", { defaultValue: "City" }),
      value: rowData => {
        return rowData.shippingAddress.city;
      }
    },
    {
      id: "shippingRegion",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingRegion", { defaultValue: "Region" }),
      value: rowData => {
        return rowData.shippingAddress.region;
      }
    },
    {
      id: "shippingCountry",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingCountry", { defaultValue: "Country" }),
      value: rowData => {
        return rowData.shippingAddress.country;
      }
    },
    {
      id: "shippingPhone",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingPhone", { defaultValue: "Phone" }),
      value: rowData => {
        return rowData.shippingPhone;
      }
    },
    {
      id: "shippingStatus",
      type: DataType.String,
      header: i18next.t("search.orderSearchResults.shippingStatus", { defaultValue: "Shipping Status" }),
      value: rowData => {
        return rowData.shippingStatus;
      },
      tdClassName: "shipping-status",
      renderer(cellData, { rowData }) { // eslint-disable-line react/no-multi-comp
        const rowClassName = _.lowerCase(rowData.shippingStatus);
        return <span className={rowClassName}>{cellData}</span>;
      }
    },
    {
      id: "orderDate",
      type: DataType.Date,
      header: i18next.t("search.orderSearchResults.orderDate", { defaultValue: "Date" }),
      value: rowData => {
        return rowData.orderDate;
      }
    },
    {
      id: "orderTotal",
      type: DataType.Number,
      header: i18next.t("search.orderSearchResults.orderTotal", { defaultValue: "Total" }),
      value: rowData => {
        return rowData.orderTotal;
      }
    }
  ];

  return columns;
}

import React from "react";
import { DataType } from "react-taco-table";
import { i18next } from "/client/api";

export default function accountsTable() {
  const columns = [
    {
      id: "_id",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.accountId", { defaultValue: "Account ID" }),
      value: (rowData) => rowData._id
    },
    {
      id: "shopId",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.shopId", { defaultValue: "Shop ID" }),
      value: (rowData) => rowData.shopId
    },
    {
      id: "firstName",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.firstName", { defaultValue: "First Name" }),
      value: (rowData) => {
        if (rowData.profile) {
          return rowData.profile.firstName;
        }
        return i18next.t("search.accountSearchResults.notAvailable", "Not available");
      }
    },
    {
      id: "lastName",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.lastName", { defaultValue: "Last Name" }),
      value: (rowData) => {
        if (rowData.profile) {
          return rowData.profile.lastName;
        }
        return i18next.t("search.accountSearchResults.notAvailable", "Not available");
      }
    },
    {
      id: "phone",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.phone", { defaultValue: "Phone" }),
      value: (rowData) => {
        if (rowData.profile) {
          return rowData.profile.phone;
        }
        return i18next.t("search.accountSearchResults.notAvailable", "Not available");
      }
    },
    {
      id: "email",
      type: DataType.String,
      header: i18next.t("search.accountSearchResults.emails", { defaultValue: "Email" }),
      value: (rowData) => rowData.emails[0]
    },
    {
      id: "manageAccount",
      type: DataType.String,
      header: "",
      value: (rowData) => rowData.emails[0],
      tdClassName: "account-manage",
      renderer(cellData, { rowData }) {
        return <span data-event-action="manageAccount" data-event-data={rowData._id}>View</span>;
      }
    }
  ];

  return columns;
}

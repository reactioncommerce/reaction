import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { SortableTable } from "/imports/plugins/core/ui/client/components";


/**
 * searchModal helpers
 */
Template.searchModal.helpers({
  accountSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("accountSearchResults");
    return results;
  },
  accountTable() {
    const instance = Template.instance();
    const results = instance.state.get("accountSearchResults");

    const columns = [
      {
        id: "_id",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.accountId", {defaultValue: "Account ID"}),
        value: rowData => {
          return rowData._id;
        }
      },
      {
        id: "shopId",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.shopId", {defaultValue: "Shop ID"}),
        value: rowData => {
          return rowData.shopId;
        }
      },
      {
        id: "firstName",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.firstName", {defaultValue: "First Name"}),
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.firstName;
          }
          return undefined;
        }
      },
      {
        id: "lastName",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.lastName", {defaultValue: "Last Name"}),
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.lastName;
          }
          return undefined;
        }
      },
      {
        id: "phone",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.phone", {defaultValue: "Phone"}),
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.phone;
          }
          return undefined;
        }
      },
      {
        id: "email",
        type: DataType.String,
        header: i18next.t("search.accountSearchResults.emails", {defaultValue: "Email"}),
        value: rowData => {
          return rowData.emails[0];
        }
      }
    ];

    return {
      component: SortableTable,
      data: results,
      columns: columns
    };
  }
});

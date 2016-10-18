import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { Reaction, Router, i18next } from "/client/api";
import { SortableTable } from "/imports/plugins/core/ui/client/components";


/**
 * orderResults helpers
 */
Template.searchModal.helpers({
  orderSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("orderSearchResults");
    return results;
  },
  orderTable() {
    const instance = Template.instance();
    const results = instance.state.get("orderSearchResults");
    // const route = rowData.url;
    const columns = [
      {
        id: "_id",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.orderId", {defaultValue: "Order ID"}),
        renderer(cellData, { column, rowData }) {
          return <a data-event-action="goToOrder" data-event-data={cellData}>{cellData}</a>;
        }
      },
      {
        id: "shippingName",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingName", {defaultValue: "Name"}),
        value: rowData => {
          return rowData.shippingName;
        }
      },
      {
        id: "userEmail",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.userEmails", {defaultValue: "Email"}),
        value: rowData => {
          return rowData.userEmails[0];
        }
      },
      {
        id: "shippingAddress",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingAddress", {defaultValue: "Address"}),
        value: rowData => {
          return rowData.shippingAddress.address;
        }
      },
      {
        id: "shippingCity",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingCity", {defaultValue: "City"}),
        value: rowData => {
          return rowData.shippingAddress.city;
        }
      },
      {
        id: "shippingRegion",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingRegion", {defaultValue: "Region"}),
        value: rowData => {
          return rowData.shippingAddress.region;
        }
      },
      {
        id: "shippingCountry",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingCountry", {defaultValue: "Country"}),
        value: rowData => {
          return rowData.shippingAddress.country;
        }
      },
      {
        id: "shippingPhone",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingPhone", {defaultValue: "Phone"}),
        value: rowData => {
          return rowData.shippingPhone;
        }
      },
      {
        id: "shippingStatus",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingStatus", {defaultValue: "Shipping Status"}),
        value: rowData => {
          return rowData.shippingStatus;
        },
        tdClassName: "shipping-status",
        renderer(cellData, { column, rowData }) {
          const rowClassName = _.lowerCase(rowData.shippingStatus);
          return <span className={rowClassName}>{cellData}</span>;
        }
      },
      {
        id: "orderDate",
        type: DataType.Date,
        header: i18next.t("search.orderSearchResults.orderDate", {defaultValue: "Date"}),
        value: rowData => {
          return rowData.orderDate;
        }
      },
      {
        id: "orderTotal",
        type: DataType.Number,
        header: i18next.t("search.orderSearchResults.orderTotal", {defaultValue: "Total"}),
        value: rowData => {
          return rowData.orderTotal;
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


/**
 * orderResults events
 */
Template.searchModal.events({
  "click [data-event-action=goToOrder]": function (event) {
    const instance = Template.instance();
    const view = instance.view;
    const isActionViewOpen = Reaction.isActionViewOpen();
    const orderId = $(event.target).data("event-data");

    // toggle detail views
    if (isActionViewOpen === false) {
      Reaction.showActionView({
        label: "Order Details",
        i18nKeyLabel: "orderWorkflow.orderDetails",
        data: instance.data.order,
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });
    }

    Reaction.Router.go("dashboard/orders", {}, {
      _id: orderId
    });

    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  }
});

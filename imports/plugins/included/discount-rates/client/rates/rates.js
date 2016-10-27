import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { SortableTable } from "/imports/plugins/core/ui/client/components";

// import { ReactiveDict } from "meteor/reactive-dict";
// import { AutoForm } from "meteor/aldeed:autoform";
// import { Shops } from "/lib/collections";
// import { Countries } from "/client/collections";
// import { i18next } from "/client/api";
// import { Discounts} from "/imports/plugins/core/discounts/lib/collections";

Template.customDiscountRates.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Discounts");
  });
});

/**
 * discountSearch helpers
 */
Template.customDiscountRates.helpers({
  discountSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("discountSearchResults");
    return results;
  },
  discountTable() {
    const instance = Template.instance();
    const results = instance.state.get("discountSearchResults");
    console.log("results", results);

    const columns = [
      {
        id: "_id",
        type: DataType.String,
        header: i18next.t("search.discountSearchResults.discountId", {defaultValue: "Account ID"}),
        value: rowData => {
          return rowData._id;
        }
      },
      {
        id: "shopId",
        type: DataType.String,
        header: i18next.t("search.discountSearchResults.shopId", {defaultValue: "Shop ID"}),
        value: rowData => {
          return rowData.shopId;
        }
      },
      {
        id: "firstName",
        type: DataType.String,
        header: i18next.t("search.discountSearchResults.firstName", {defaultValue: "First Name"}),
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
        header: i18next.t("search.discountSearchResults.lastName", {defaultValue: "Last Name"}),
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
        header: i18next.t("search.discountSearchResults.phone", {defaultValue: "Phone"}),
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
        header: i18next.t("search.discountSearchResults.emails", {defaultValue: "Email"}),
        value: rowData => {
          return rowData.emails[0];
        }
      },
      {
        id: "manageAccount",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingStatus", {defaultValue: "Shipping Status"}),
        value: rowData => {
          return rowData.emails[0];
        },
        tdClassName: "discount-manage",
        renderer(cellData, { column, rowData }) {
          return <span data-event-action="manageAccount" data-event-data={rowData._id}>Manage</span>;
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


// /**
//  * orderResults events
//  */
// Template.searchModal.events({
//   "click [data-event-action=manageAccount]": function (event) {
//     const instance = Template.instance();
//     const view = instance.view;
//
//     const userId = $(event.target).data("event-data");
//
//     Reaction.showActionView({
//       label: "Permissions",
//       i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
//       data: userPermissions(userId),
//       template: "memberSettings"
//     });
//
//     Reaction.Router.go("dashboard/discounts", {}, {});
//
//     $(".js-search-modal").delay(400).fadeOut(400, () => {
//       Blaze.remove(view);
//     });
//   }
// });

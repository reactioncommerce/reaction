import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { SortableTable } from "/imports/plugins/core/ui/client/components";

function userPermissions(userId) {
  if (Reaction.hasPermission("reaction-accounts")) {
    const shopId = Reaction.getShopId();
    const user = Meteor.users.findOne(userId);
    const member = {};

    member.userId = user._id;

    if (user.emails && user.emails.length) {
      // this is some kind of denormalization. It is helpful to have both
      // of this string and array. Array goes to avatar, string goes to
      // template
      member.emails = user.emails;
      member.email = user.emails[0].address;
    }
    // member.user = user;
    member.username = user.username;
    member.isAdmin = Roles.userIsInRole(user._id, "admin", shopId);
    member.roles = user.roles;
    member.services = user.services;

    if (Roles.userIsInRole(member.userId, "owner", shopId)) {
      member.role = "owner";
    } else if (Roles.userIsInRole(member.userId, "admin", shopId)) {
      member.role = "admin";
    } else if (Roles.userIsInRole(member.userId, "dashboard", shopId)) {
      member.role = "dashboard";
    } else if (Roles.userIsInRole(member.userId, "guest", shopId)) {
      member.role = "guest";
    }

    return member;
  }
}


Template.searchModal.onCreated(function () {
  this.autorun(() => {
    this.subscribe("ShopMembers");
  });
});

/**
 * accountSearch helpers
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
      },
      {
        id: "manageAccount",
        type: DataType.String,
        header: i18next.t("search.orderSearchResults.shippingStatus", {defaultValue: "Shipping Status"}),
        value: rowData => {
          return rowData.emails[0];
        },
        tdClassName: "account-manage",
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


/**
 * orderResults events
 */
Template.searchModal.events({
  "click [data-event-action=manageAccount]": function (event) {
    const instance = Template.instance();
    const view = instance.view;

    const userId = $(event.target).data("event-data");

    Reaction.showActionView({
      label: "Permissions",
      i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
      data: userPermissions(userId),
      template: "memberSettings"
    });

    Reaction.Router.go("dashboard/accounts", {}, {});

    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  }
});

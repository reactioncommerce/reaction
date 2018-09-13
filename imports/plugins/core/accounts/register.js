import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import groupSchema from "./server/no-meteor/group.graphql";
import roleSchema from "./server/no-meteor/role.graphql";
import schema from "./server/no-meteor/schema.graphql";

/**
 * @file Accounts core plugin: Manage how members sign into your shop
 *
 * @namespace Accounts
 */

Reaction.registerPackage({
  label: "Accounts",
  name: "reaction-accounts",
  icon: "fa fa-users",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas: [schema, groupSchema, roleSchema]
  },
  mutations,
  queries,
  settings: {},
  registry: [{
    route: "/dashboard/accounts",
    name: "accounts",
    provides: ["dashboard"],
    label: "Accounts",
    description: "Manage how members sign into your shop.",
    icon: "fa fa-users",
    container: "core",
    template: "accountsDashboard",
    workflow: "coreAccountsWorkflow",
    priority: 1
  }, {
    route: "/account/profile/verify",
    label: "Account Verify",
    name: "account/verify",
    workflow: "coreAccountsWorkflow",
    template: "VerifyAccount"
  }, {
    label: "Account Settings",
    icon: "fa fa-sign-in",
    provides: ["settings"],
    route: "/dashboard/account/settings",
    container: "accounts",
    workflow: "coreAccountsWorkflow",
    template: "accountsSettings",
    showForShopTypes: ["primary"]
  }, {
    route: "/dashboard/accounts",
    name: "dashboard/accounts",
    workflow: "coreAccountsWorkflow",
    provides: ["shortcut"],
    label: "Accounts",
    icon: "fa fa-users",
    priority: 1,
    container: "dashboard",
    template: "accountsDashboard"
  }, {
    route: "/account/profile",
    template: "accountProfile",
    name: "account/profile",
    label: "Profile",
    icon: "fa fa-user",
    provides: ["userAccountDropdown"]
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreAccountsWorkflow",
    collection: "Accounts",
    theme: "default",
    enabled: true,
    structure: {
      template: "accountsDashboard",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});

import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Accounts",
  name: "reaction-accounts",
  icon: "fa fa-users",
  autoEnable: true,
  settings: {},
  registry: [{
    route: "/dashboard/accounts",
    name: "accounts",
    provides: "dashboard",
    label: "Accounts",
    description: "Manage how members sign into your shop.",
    icon: "fa fa-users",
    container: "core",
    template: "accountsDashboard",
    workflow: "coreAccountsWorkflow",
    priority: 1
  }, {
    label: "Account Settings",
    icon: "fa fa-sign-in",
    provides: "settings",
    route: "/dashboard/account/settings",
    container: "accounts",
    workflow: "coreAccountsWorkflow",
    template: "accountsSettings"
  }, {
    route: "/dashboard/accounts",
    name: "dashboard/accounts",
    workflow: "coreAccountsWorkflow",
    provides: "shortcut",
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
    provides: "userAccountDropdown"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreAccountsWorkflow",
    collection: "Accounts",
    theme: "default",
    enabled: true,
    structure: {
      template: "accountsDashboard",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});

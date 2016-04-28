import { Reaction } from "/server/api";

export default function () {
  Reaction.registerPackage({
    label: "Accounts",
    name: "reaction-accounts",
    icon: "fa fa-sign-in",
    autoEnable: true,
    settings: {},
    registry: [{
      route: "/dashboard/accounts",
      name: "accounts",
      provides: "dashboard",
      label: "Accounts",
      description: "Manage how members sign into your shop.",
      icon: "fa fa-sign-in",
      container: "core",
      template: "accountsDashboard",
      workflow: "coreAccountsWorkflow",
      priority: 1
    }, {
      label: "Add Shop Member",
      icon: "fa fa-user-plus",
      provides: "settings",
      container: "accounts",
      template: "memberForm",
      priority: 2
    }, {
      label: "Account Settings",
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
      priority: 1
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
}

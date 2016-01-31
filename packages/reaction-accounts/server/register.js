ReactionCore.registerPackage({
  label: "Accounts",
  name: "reaction-accounts",
  icon: "fa fa-sign-in",
  autoEnable: true,
  settings: {},
  registry: [{
    route: "dashboard/accounts",
    provides: "dashboard",
    label: "Accounts",
    description: "Manage how members sign into your shop.",
    icon: "fa fa-sign-in",
    container: "accounts",
    template: "accounts",
    cycle: 1,
    permissions: [{
      label: "Accounts",
      permission: "dashboard/accounts"
    }]
  }, {
    label: "Account Settings",
    route: "dashboard/accounts",
    provides: "settings",
    container: "accounts",
    template: "accountsSettings"
  }, {
    route: "dashboard/accounts",
    provides: "shortcut",
    label: "Accounts",
    icon: "fa fa-users",
    cycle: 1
  }, {
    route: "account/profile",
    label: "Profile",
    icon: "fa fa-user",
    provides: "userAccountDropdown"
  }],
  permissions: [{
    label: "Accounts",
    permission: "dashboard/accounts"
  }]
});

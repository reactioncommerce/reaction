ReactionCore.registerPackage({
  name: 'reaction-accounts',
  autoEnable: true,
  allowDisable: false,
  registry: [
    {
      provides: 'dashboard',
      label: 'Accounts',
      description: 'Manage how members sign into your shop.',
      icon: 'fa fa-sign-in',
      cycle: 3,
      container: 'accounts'
    },
    {
      route: 'accounts',
      provides: 'settings',
      container: 'accounts'
    }
  ],
  permissions: [
    {
      label: 'Accounts',
      permission: 'dashboard/accounts',
      group: 'Shop Settings'
    }
  ]
});

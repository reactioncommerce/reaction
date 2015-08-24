ReactionCore.registerPackage({
  name: 'reaction-analytics',
  autoEnable: false,
  settings: {
    "public": {
      segmentio: {
        enabled: false,
        api_key: ""
      },
      googleAnalytics: {
        enabled: false,
        api_key: ""
      },
      mixpanel: {
        enabled: false,
        api_key: ""
      }
    }
  },
  registry: [
    {
      provides: 'dashboard',
      label: 'Reaction Analytics',
      description: "Event tracking and analytics with Reaction",
      icon: "fa fa-bar-chart-o",
      cycle: '3',
      container: 'dashboard'
    }, {
      route: 'reactionAnalytics',
      provides: 'settings',
      container: 'dashboard'
    }
  ],
  permissions: [
    {
      label: "Reaction Analytics",
      permission: "dashboard/settings",
      group: "Shop Settings"
    }
  ]
});

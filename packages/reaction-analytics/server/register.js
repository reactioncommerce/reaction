ReactionCore.registerPackage({
  name: 'reaction-analytics',
  icon: "fa fa-bar-chart-o",
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
      label: "Analytics Settings",
      i18nLabel: "app.analyticsSettings",
      route: 'reactionAnalytics',
      provides: 'settings',
      container: 'dashboard',
      template: 'reactionAnalyticsSettings'
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

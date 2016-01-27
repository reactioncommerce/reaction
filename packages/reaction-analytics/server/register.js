ReactionCore.registerPackage({
  name: "reaction-analytics",
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
      provides: "dashboard",
      label: "Analytics",
      description: "Event tracking and analytics with Reaction",
      i18nKeyLabel: "admin.dashboard.analyticsLabel",
      i18nKeyDescription: "admin.dashboard.analyticsDescription",
      route: "dashboard/reactionAnalytics",
      icon: "fa fa-bar-chart-o",
      cycle: "3",
      container: "dashboard"
    }, {
      label: "Analytics Settings",
      i18nKeyLabel: "admin.settings.analytics",
      route: "dashboard/reactionAnalytics",
      provides: "settings",
      container: "dashboard",
      template: "reactionAnalyticsSettings"
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

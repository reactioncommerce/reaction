/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  name: "reaction-analytics",
  icon: "fa fa-bar-chart-o",
  autoEnable: false,
  settings: {
    public: {
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
  registry: [{
    provides: "dashboard",
    label: "Analytics",
    description: "Analytics and tracking integrations",
    template: "reactionAnalytics",
    icon: "fa fa-bar-chart-o",
    priority: 3,
    container: "connect",
    permissions: [{
      label: "Reaction Analytics",
      permission: "dashboard/analytics"
    }]
  }, {
    label: "Analytics Settings",
    route: "/dashboard/analytics/settings",
    provides: "settings",
    container: "dashboard",
    template: "reactionAnalyticsSettings"
  }]
});

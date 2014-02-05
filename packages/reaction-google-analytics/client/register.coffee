Meteor.app.packages.register
  name: "reaction-google-analytics"
  label: "Google Analytics"
  description: ""
  icon: "fa fa-bar-chart-o fa-5x"
  settingsRoute: "googleAnalytics"
  hasWidget: true
  priority: "4"
  shopPermissions: [
    {
      label: "Google Analytics"
      permission: "dashboard/settings"
      group: "Shop Settings"
    }
  ]
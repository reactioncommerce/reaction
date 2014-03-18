Meteor.app.packages.register
  name: "reaction-google-analytics"
  provides: ['analytics']
  label: "Google Analytics"
  description: "Event tracking with Google Analytics"
  icon: "fa fa-bar-chart-o"
  settingsRoute: "dashboard/settings/google"
  hasWidget: false
  priority: "4"
  shopPermissions: [
    {
      label: "Google Analytics"
      permission: "dashboard/settings"
      group: "Shop Settings"
    }
  ]
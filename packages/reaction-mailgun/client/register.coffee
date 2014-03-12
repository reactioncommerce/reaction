Meteor.app.packages.register
  name: 'reaction-mailgun'
  depends: []
  label: 'Mailgun Settings'
  description: 'Configure Mailgun'
  icon: 'fa fa-envelope'
  settingsRoute: 'mailgun'
  priority: '3'
  hasWidget: true
  shopPermissions: [
    {
      label: "Mailgun Settings"
      permission: "dashboard/mailgun"
      group: "Shop Settings"
    }
  ]

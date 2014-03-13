Meteor.app.packages.register
  name: 'reaction-mailgun'
  depends: []
  provides: ['mailService']
  label: 'Mailgun'
  description: 'Use mailgun to send emails'
  icon: 'fa fa-envelope'
  settingsRoute: 'mailgun'
  priority: '3'
  hasWidget: false
  hidden: false
  shopPermissions: [
    {
      label: "Mailgun Settings"
      permission: "dashboard/mailService"
      group: "Shop Settings"
    }
  ]

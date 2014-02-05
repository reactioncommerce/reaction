Meteor.app.packages.register
  name: 'reaction-paypal'
  depends: []
  label: 'PayPal'
  description: 'Accept PayPal'
  icon: 'fa fa-shopping-cart fa-5x'
  settingsRoute: 'paypal'
  priority: '3'
  hasWidget: true
  shopPermissions: [
    {
      label: "Pay Pal"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]
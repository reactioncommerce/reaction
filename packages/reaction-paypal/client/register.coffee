Meteor.app.packages.register
  name: 'reaction-paypal'
  provides: ['paymentMethod']
  label: 'PayPal'
  description: 'Accept PayPal'
  icon: 'fa fa-shopping-cart'
  settingsRoute: 'paypal'
  priority: '2'
  hasWidget: false
  shopPermissions: [
    {
      label: "Pay Pal"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]
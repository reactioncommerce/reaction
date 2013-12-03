Meteor.app.packages.push(
  name: 'reaction-shop',
  label: 'Shop',
  description: 'Reaction Shop',
  icon: 'fa fa-shopping-cart fa-5x',
  route: 'shop',
  template: 'shopwelcome',
  priority: '3'
)
Meteor.app.packages.push(
  name: 'reaction-shop-orders',
  label: 'Orders',
  route: 'shop/orders'
)

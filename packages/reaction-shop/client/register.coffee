Meteor.app.packages.register
  name: 'reaction-shop'
  depends: ['orderManager', 'fileUploader']
  label: 'Shop'
  description: 'Reaction Shop'
  icon: 'fa fa-shopping-cart fa-5x'
  route: 'shop'
  template: 'shopwelcome'
  priority: '3'
  hasWidget: true
  shopPermissions: [
    {
      label: "Products management"
      name: "/shop/products"
      scope: "shop"
    }
  ]

Meteor.app.packages.register
  name: 'reaction-shop-orders'
  provides: ['orderManager']
  label: 'Orders'
  route: 'shop/orders'
  hasWidget: false

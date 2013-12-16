Meteor.app.packages.push
  name: 'reaction-shop'
  label: 'Shop'
  description: 'Reaction Shop'
  icon: 'fa fa-shopping-cart fa-5x'
  route: 'shop'
  template: 'shopwelcome'
  priority: '3'
  shopPermissions: [
    {
      label: "Customers"
      permission: "/shop/customers"
      group: "Shop Management"
    }
    {
      label: "Orders"
      permission: "/shop/orders"
      group: "Shop Management"
    }
    {
      label: "Promotions"
      permission: "/shop/promotions"
      group: "Shop Management"
    }
    {
      label: "Products"
      permission: "/shop/products"
      group: "Shop Content"
    }
    {
      label: "Collections"
      permission: "/shop/collections"
      group: "Shop Content"
    }
    {
      label: "Preferences"
      permission: "/shop/preferences"
      group: "Shop Settings"
    }
  ]

Meteor.app.packages.push
  name: 'reaction-shop-orders'
  label: 'Orders'
  route: 'shop/orders'

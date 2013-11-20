Router.map ->
  # home page intro screen for reaction-shop
  this.route 'shop', {template: 'shopwelcome'}
  # list page of customer records
  this.route 'shop/customers'
  # list page of shop orders
  this.route 'shop/orders'
  # list page of products
  this.route 'shop/products',
    yieldTemplates:
      'shopnav': to: 'header'

  # edit product page
  this.route 'shop/product',
    path: '/shop/products/:_id'
    data: ->
      Session.set('currentProductId', this.params._id)
      Products.findOne(this.params._id)
    template: 'productsEdit'
  #add new products
  this.route 'shop/product/add',
    path: '/shop/products/add'
    template: 'productsEdit'
ShopController = RouteController.extend
  before: ->
    user = Meteor.user()
    unless Roles.userIsInRole(user, 'admin')
      unless ShopRoles.userIsInRole(Session.get('currentShopId'), user, ['owner', 'manager', 'vendor'])
        this.render('unauthorized')
        this.stop()

Router.map ->
  # home page intro screen for reaction-shop
  this.route 'shop',
    controller: ShopController
    template: 'shopwelcome'
  # list page of customer records
  this.route 'shop/customers',
    controller: ShopController
  # list page of shop orders
  this.route 'shop/orders',
    controller: ShopController
  # list page of products
  this.route 'shop/products',
    controller: ShopController,
    yieldTemplates:
      'shopHeader': to: 'header'

  # edit product page
  this.route 'shop/product',
    # controller: ShopController
    path: '/shop/products/:_id'
    data: ->
      Session.set('currentProductId', this.params._id)
      Products.findOne(this.params._id)
    template: 'productsEdit'
  #add new products
  this.route 'shop/product/add',
    path: '/shop/products/add'
    template: 'productsEdit'

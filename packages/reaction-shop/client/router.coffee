ShopController = RouteController.extend
  yieldTemplates:
    'shopHeader': to: 'header'
    'dashboardSidebar': to: 'sidebar'
  before: ->
    @subscribe('shops').wait()
    shop = Shops.findOne()
    unless shop
      @render('shopNotFound')
      @stop()
    else
      packageShop.shopId = shop._id

ShopAdminController = ShopController.extend
  before: ->
    if packageShop.shopId
      user = Meteor.user()
      unless Roles.userIsInRole(user, 'admin')
        unless ShopRoles.userIsInRole(packageShop.shopId, user, ['owner', 'manager', 'vendor'])
          this.render('unauthorized')
          this.stop()

Router.map ->
  # home page intro screen for reaction-shop
  this.route 'shop',
    controller: ShopAdminController
    template: 'shopwelcome'
  this.route 'shop/settings/general',
    controller: ShopAdminController
    path: '/shop/settings/general'
    data: ->
      shop: Shops.findOne packageShop.shopId
    template: 'settingsGeneral'
  this.route 'shop/settings/account',
    controller: ShopAdminController
    path: '/shop/settings/account'
    data: ->
      shop: Shops.findOne packageShop.shopId
      members: Meteor.users.find {'shopRoles.shopId': packageShop.shopId}
    template: 'settingsAccount'
  # list page of customer records
  this.route 'shop/customers',
    controller: ShopAdminController
  # list page of shop orders
  this.route 'shop/orders',
    controller: ShopAdminController
  # list page of products
  this.route 'shop/products',
    controller: ShopAdminController
  # edit product page
  this.route 'shop/product',
    controller: ShopController
    path: '/shop/products/:_id'
    data: ->
      Session.set('currentProductId', this.params._id)
      Products.findOne(this.params._id)
    template: 'productsEdit'
  #add new products
  this.route 'shop/product/add',
    controller: ShopAdminController
    path: '/shop/products/add'
    template: 'productsEdit'

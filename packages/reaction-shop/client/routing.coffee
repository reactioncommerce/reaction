ShopController = RouteController.extend
  yieldTemplates:
    'shopHeader': to: 'header'
    'dashboardSidebar': to: 'sidebar'
  before: ->
# should we make it a default as Router.before?
    @subscribe('shops').wait()
    shop = Shops.findOne()
    unless shop
      @render('loading')
      @stop()
    else
      Meteor.app.init shop

ShopAdminController = ShopController.extend
  before: ->
    unless Meteor.app.hasPermission(@path)
      @render('unauthorized')
      @stop()

Router.map ->
  # home page intro screen for reaction-shop
  @route 'shop',
    controller: ShopAdminController
    template: 'shopwelcome'
  @route 'shop/settings/general',
    controller: ShopAdminController
    path: '/shop/settings/general'
    data: ->
      shop: Shops.findOne Meteor.app.shopId
    template: 'settingsGeneral'
  @route 'shop/settings/account',
    controller: ShopAdminController
    path: '/shop/settings/account'
    waitOn: ->
      Meteor.subscribe 'shopMembers'
    data: ->
      shop: Shops.findOne Meteor.app.shopId
    template: 'settingsAccount'
  # list page of customer records
  @route 'shop/customers',
    controller: ShopAdminController
  # list page of shop orders
  @route 'shop/orders',
    controller: ShopAdminController
  # list page of products
  @route 'shop/products',
    controller: ShopAdminController
  @route 'shop/tag',
    controller: ShopController
    path: 'shop/tag/:_id',
    data: ->
      tag: Tags.findOne(@params._id)
    template: "productListGrid"
  # edit product page
  @route 'shop/product',
    controller: ShopController
    path: '/shop/products/:_id'
    before: ->
      product = Products.findOne(@params._id)
      if !product.isVisible
        if !Meteor.app.hasPermission(@path)
          @render('unauthorized')
          @stop()
    data: ->
      Session.set('currentProductId', @params._id)
      Products.findOne(@params._id)
    template: 'productsEdit'
  #checkout
  @route 'shoppingCartCheckout',
    path: 'checkout',
    template: 'shoppingCartCheckout'

ShopController = RouteController.extend
  yieldTemplates:
    'shopHeader': to: 'header'
    'dashboardSidebar': to: 'sidebar'
    'siteFooter': to: 'footer'
  before: ->
# should we make it a default as Router.before?
    @subscribe('shops').wait()
    shop = Shops.findOne()
    unless shop
      @render('loading')
      @stop()
    else
      Meteor.app.init shop

@ShopAdminController = ShopController.extend
  before: ->
    unless Meteor.app.hasPermission(@route.name)
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
    waitOn: ->
      # set current variant and products
      currentProduct.set "product", Products.findOne(@params._id)
      setVariant(@params.variant)
    before: ->
      unless Products.findOne(@params._id)?.isVisible
        unless Meteor.app.hasPermission(@path)
          @render('unauthorized')
          @stop()
    data: ->
      currentProduct.get "product"
    template: 'productDetail'
  #checkout
  @route 'cartCheckout',
    path: 'checkout',
    template: 'cartCheckout'
    waitOn: ->
      [share.ConfigDataHandle]
    yieldTemplates:
      checkoutHeader:
        to: "header"
  #completed orders
  @route 'cartCompleted',
    path: 'completed/:_id',
    template: 'cartCompleted'
    waitOn: ->
      [share.ConfigDataHandle]
    data: ->
      Orders.findOne(@params._id)

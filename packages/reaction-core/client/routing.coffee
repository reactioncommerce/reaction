Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"

Router.before ->
  Alerts.removeSeen()
  @subscribe('shops').wait()
  @subscribe('Packages').wait()
  @subscribe('cart', Session.get "sessionId", Meteor.userId()).wait()
  shop = Shops.findOne()
  unless shop
    @render('loading')
    @stop()
  else
    Meteor.app.init shop

ShopController = RouteController.extend
  yieldTemplates:
    layoutHeader:
      to: "layoutHeader"

    layoutFooter:
      to: "layoutFooter"

    dashboard:
      to: "dashboard"

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
  # home page intro screen for reaction-commerce
  @route 'dashboard',
    controller: ShopAdminController
    before: ->
      Session.set "dashboard", true
    template: 'dashboardPackages'

  @route 'dashboard/settings/shop',
    controller: ShopAdminController
    path: '/dashboard/settings/shop'
    data: ->
      shop: Shops.findOne Meteor.app.shopId
    template: 'settingsGeneral'

  @route 'dashboard/settings/account',
    controller: ShopAdminController
    path: '/dashboard/settings/account'
    waitOn: ->
      Meteor.subscribe 'shopMembers'
    data: ->
      shop: Shops.findOne Meteor.app.shopId
    template: 'settingsAccount'

  @route 'dashboard/settings/shop',
    controller: ShopAdminController
    path: '/shop/settings/general'
    path: '/dashboard/settings/shop'
    data: ->
      shop: Shops.findOne Meteor.app.shopId
    template: 'settingsGeneral'
  @route 'shop/settings/account',


  # list page of customer records
  @route 'dashboard/customers',
    controller: ShopAdminController

  # list page of shop orders
  @route 'dashboard/orders',
    controller: ShopAdminController
    path: 'dashboard/orders/',
    template: 'orders'
    waitOn: ->
      [share.ConfigDataHandle]
    data: ->
      Orders.find(@params._id)

  # display products by tag
  @route 'product/tag',
    controller: ShopController
    path: 'product/tag/:_id',
    data: ->
      tag: Tags.findOne(@params._id)
    template: "products"

  # product view / edit page
  @route 'product',
    controller: ShopController
    path: 'product/:_id'
    waitOn: ->
      # set current variant and products
      product = Products.findOne(@params._id)
      currentProduct.set "product", product
      if product?.variants
        if @params.variant
          for variant in product.variants
            if variant._id is @params.variant
              currentProduct.set "variant",variant
        else
          # TODO: better way of doing this. Check if this
          # current variant set for this product, otherwise first
          # variant is defaulted.
          result = (variant._id for variant in product.variants when variant._id is (currentProduct.get "variant")?._id)
          currentProduct.set "variant", product.variants[0] unless result[0]
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
      @subscribe('cart', Session.get "sessionId", Meteor.userId()).wait()
      [share.ConfigDataHandle]
    yieldTemplates:
      checkoutHeader:
        to: "layoutHeader"

  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id',
    template: 'cartCompleted'
    waitOn: ->
      [share.ConfigDataHandle]
    data: ->
      Orders.findOne(@params._id)

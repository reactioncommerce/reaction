Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"

Router.before ->
  @subscribe('shops').wait()
  @subscribe('cart', Session.get "sessionId", Meteor.userId()).wait()
  shop = Shops.findOne()
  unless shop
    @render('loading')
    @stop()
  else
    Meteor.app.init shop

ShopController = RouteController.extend
  yieldTemplates:
    templateHeader:
      to: "templateHeader"

    templateFooter:
      to: "templateFooter"

    dashboardSidebar:
      to: "sidebar"
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
    template: 'dashboard'
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
  @route 'dashboard/orders',
    controller: ShopAdminController
    path: 'dashboard/orders/',
    template: 'orders'
    waitOn: ->
      [share.ConfigDataHandle]
    data: ->
      Orders.find(@params._id)
  # list page of products
  @route 'shop/products',
    controller: ShopAdminController
  @route 'shop/tag',
    controller: ShopController
    path: 'shop/tag/:_id',
    data: ->
      tag: Tags.findOne(@params._id)
    template: "productListGrid"
  # product view / edit page
  @route 'shop/product',
    controller: ShopController
    path: '/shop/products/:_id'
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
        to: "templateHeader"
  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id',
    template: 'cartCompleted'
    waitOn: ->
      [share.ConfigDataHandle]
    data: ->
      Orders.findOne(@params._id)

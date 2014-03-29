Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  waitOn: ->
    @subscribe('shops')
    @subscribe('Packages')
    @subscribe('cart', Session.get "sessionId", Meteor.userId())
    [share.ConfigDataHandle]
  onBeforeAction: (pause) ->
    shop = Shops.findOne()
    cart = Cart.findOne()
    unless shop and cart
      @render('loading')
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


@ShopAdminController = ShopController.extend
  onBeforeAction: (pause) ->
    unless Meteor.app.hasPermission(@route.name)
      @render('unauthorized')
      pause()

Router.map ->
  # home page intro screen for reaction-commerce
  @route 'dashboard',
    controller: ShopAdminController
    template: 'dashboardPackages'
    onBeforeAction: ->
      Session.set "dashboard", true

  @route 'dashboard/settings/shop',
    controller: ShopAdminController
    path: '/dashboard/settings/shop'
    template: 'settingsGeneral'
    data: ->
      shop: Shops.findOne Meteor.app.shopId

  @route 'dashboard/settings/account',
    controller: ShopAdminController
    path: '/dashboard/settings/account'
    template: 'settingsAccount'
    waitOn: ->
      Meteor.subscribe 'shopMembers'
    data: ->
      shop: Shops.findOne Meteor.app.shopId

  # list page of customer records
  @route 'dashboard/customers',
    controller: ShopAdminController

  # list page of shop orders
  @route 'dashboard/orders',
    controller: ShopAdminController
    path: 'dashboard/orders/'
    template: 'orders'
    data: ->
      Orders.find(@params._id)

  # display products by tag
  @route 'product/tag',
    controller: ShopController
    path: 'product/tag/:_id'
    template: "products"
    data: ->
      tag: Tags.findOne(@params._id)

  # product view / edit page
  @route 'product',
    controller: ShopController
    path: 'product/:_id'
    template: 'productDetail'
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
    onBeforeAction: (pause) ->
      unless Products.findOne(@params._id)?.isVisible
        unless Meteor.app.hasPermission(@path)
          @render('unauthorized')
          pause()
    data: ->
      currentProduct.get "product"

  #checkout
  @route 'cartCheckout',
    path: 'checkout',
    template: 'cartCheckout'
    yieldTemplates:
      checkoutHeader:
        to: "layoutHeader"
    data: ->
      Cart.findOne()

  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id',
    template: 'cartCompleted'
    data: ->
      Orders.findOne(@params._id)

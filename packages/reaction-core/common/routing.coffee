###
# Helper method to set default/parameterized product variant
###
setProduct = (productId, variantId) ->
  unless productId.match /^[A-Za-z0-9]{17}$/
    product = Products.findOne({handle: productId.toLowerCase()})
    productId = product?._id

  setCurrentProduct productId
  setCurrentVariant variantId
  return

###
#  Global Reaction Routes
#  Extend/override in reaction/client/routing.coffee
###
Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  onBeforeAction: ->
    @render "loading"
    Alerts.removeSeen()
    @next()
    return


@ShopController = RouteController.extend
  waitOn: ->
    @subscribe "shops"
    @subscribe "cart", Session.get "sessionId", Meteor.userId()
  onAfterAction: ->
    ReactionCore.MetaData.refresh(@route, @params)
    return
  layoutTemplate: "coreLayout"
  yieldTemplates:
    layoutHeader:
      to: "layoutHeader"
    layoutFooter:
      to: "layoutFooter"
    dashboard:
      to: "dashboard"
ShopController = @ShopController

@ShopAdminController = @ShopController.extend
  waitOn: ->
    @subscribe "shops"
  onBeforeAction: () ->
    unless ReactionCore.hasPermission(@route.getName())
      @render('unauthorized')
    else
      @next()
    return

ShopAdminController = @ShopAdminController

Router.map ->
  # default index route, normally overriden parent meteor app
  @route "index",
    controller: ShopController
    path: "/"
    name: "index"
    template: "products"
    waitOn: ->
      @subscribe "products"

  # home page intro screen for reaction-commerce
  @route 'dashboard',
    controller: ShopAdminController
    template: 'dashboardPackages'
    onBeforeAction: ->
      Session.set "dashboard", true
      @next()

  @route 'dashboard/settings/shop',
    controller: ShopAdminController
    path: '/dashboard/settings/shop'
    template: 'settingsGeneral'
    data: ->
      Shops.findOne()

  @route 'dashboard/settings/account',
    controller: ShopAdminController
    path: '/dashboard/settings/account'
    template: 'settingsAccount'


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
    waitOn: ->
      @subscribe "products"
    subscriptions: ->
      @subscribe "tags"
    data: ->
      if @ready()
        id = @params._id
        if id.match  /^[A-Za-z0-9]{17}$/
          return tag: Tags.findOne(id)
        else
          return tag: Tags.findOne(slug: id.toLowerCase())

  # product view / edit page
  @route 'product',
    controller: ShopController
    path: 'product/:_id/:variant?'
    template: 'productDetail'
    waitOn: ->
      return Meteor.subscribe 'product', @params._id
    onBeforeAction: ->
      variant = @params.variant || @params.query.variant
      setProduct @params._id, variant
      @next()
      return
    data: ->
      product = selectedProduct()
      if @ready() and product
        unless product.isVisible
          unless ReactionCore.hasPermission(@url)
            @render 'unauthorized'
        return product

  #checkout
  @route 'cartCheckout',
    layoutTemplate: "layout"
    path: 'checkout',
    template: 'cartCheckout'
    yieldTemplates:
      checkoutHeader:
        to: "layoutHeader"
    waitOn: ->
      @subscribe "cart", Session.get "sessionId", Meteor.userId()
    subscriptions: ->
      @subscribe "shops"
      @subscribe "products"
      @subscribe "shipping"
      @subscribe "userOrders", Meteor.userId()
    data: ->
      if @.ready()
        return Cart.findOne()

  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id',
    template: 'cartCompleted'
    waitOn: ->
      @subscribe "userOrders", Meteor.userId()
    data: ->
      if @.ready()
        if Orders.findOne(@params._id)
          return Orders.findOne(@params._id)
        else
          @render 'unauthorized'

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
    return


@ShopController = RouteController.extend
  waitOn: ->
    @subscribe "shops"
    @subscribe "cart", Session.get "sessionId", Meteor.userId()
  onBeforeAction: 'loading'
  onRun: ->
    ReactionCore.MetaData.clear(@route, @params)
    ReactionCore.MetaData.update(@route, @params)
    ReactionCore.MetaData.render(@route, @params)
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
  onBeforeAction: (pause) ->
    unless ReactionCore.hasPermission(@route.name)
      @render('unauthorized')
      pause()
      return

ShopAdminController = @ShopAdminController

Router.map ->
  # default index route, normally overriden parent meteor app
  @route "index",
    controller: ShopController
    path: "/"
    template: "products"
    waitOn: ->
      @subscribe "products"

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
      setProduct @params._id, @params.variant
      return
    data: ->
      product = selectedProduct()
      if @ready() and product
        unless product.isVisible
          unless ReactionCore.hasPermission(@path)
            @render 'unauthorized'
            Meteor.setTimeout (->
              Router.go('/')
            ),0
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
      @subscribe "shops"
      @subscribe "products"
      @subscribe "userOrders", Meteor.userId()
      @subscribe "cart", Session.get "sessionId", Meteor.userId()
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

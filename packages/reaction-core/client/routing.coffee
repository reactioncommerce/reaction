###
# Helper method to set default/parameterized product variant
###
setCurrentVariant = (variantId) ->
  if variantId
    for variant in currentProduct.get("product").variants
      if variant._id is variantId
        currentProduct.set "variant",variant
  else
    currentProduct.set "variant", currentProduct.get("product").variants[0]

setCurrentProduct = (productId) ->
  if productId.match  /^[A-Za-z0-9]{17}$/
    currentProduct.set "product", Products.findOne(productId)
    # setCurrentVariant @params.variant
  else
    currentProduct.set "product", Products.findOne({handle: { $regex : productId, $options:"i" } })

###
#  Global Reaction Routes
#  Extend/override in reaction/client/routing.coffee
###
Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  onRun: ->
    Meteor.app.init()
  onBeforeAction: ->
    @render "loading"
    Alerts.removeSeen()
    return


@ShopController = RouteController.extend
  waitOn: ->
    @subscribe "shops"
    @subscribe "cart", Session.get "sessionId", Meteor.userId()
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
  onBeforeAction: (pause) ->
    unless Meteor.app.hasPermission(@route.name)
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
      Meteor.subscribe "products"
    onAfterAction: ->
      document.title = Shops.findOne()?.name

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
        if @params._id.match  /^[A-Za-z0-9]{17}$/
          return tag: Tags.findOne(@params._id)
        else
          text = @params._id.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
          return tag: Tags.findOne({name: { $regex : text, $options:"i" } })

    onAfterAction: ->
      document.title = this.data()?.tag.name || Shops.findOne()?.name

  # product view / edit page
  @route 'product',
    controller: ShopController
    path: 'product/:_id/:variant?'
    template: 'productDetail'
    waitOn: ->
      @subscribe 'product', @params._id
    onBeforeAction: (pause) ->
      if @.ready()
        setCurrentProduct @params._id
        setCurrentVariant @params.variant
    action: ->
      if @ready() and currentProduct.get("product")
        unless currentProduct.get("product").isVisible
          unless Meteor.app.hasPermission(@path)
            @render "unauthorized"
            return
          @render()
        @render()
      else
        @render "loading"
      return
    onAfterAction: ->
       document.title = this.data()?.title || Shops.findOne()?.name
    data: ->
      #console.log @.ready()
      if @.ready()
        return currentProduct.get "product"

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
    onAfterAction: ->
      document.title = Shops.findOne()?.name + " Checkout"

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

    onAfterAction: ->
      document.title = Shops.findOne()?.name + " Success"

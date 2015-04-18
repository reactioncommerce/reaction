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
#  Global Route Configuration
#  Extend/override in reaction/client/routing.coffee
###
Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  onBeforeAction: ->
    @render "loading"
    Alerts.removeSeen()
    @next()


# we always need to wait on these publications
Router.waitOn ->
  @subscribe "shops"
  @subscribe "Packages"

# general reaction controller
@ShopController = RouteController.extend
  onAfterAction: ->
    ReactionCore.MetaData.refresh(@route, @params)
  layoutTemplate: "coreLayout"
  yieldTemplates:
    layoutHeader:
      to: "layoutHeader"
    layoutFooter:
      to: "layoutFooter"
    dashboard:
      to: "dashboard"
# local ShopController
ShopController = @ShopController

# admin specific shop controller
@ShopAdminController = @ShopController.extend
  onBeforeAction: () ->
    # could check for roles here for dashboard access
    unless ReactionCore.hasPermission(@route.getName()) and Meteor.userId()
      @render('unauthorized')
    else
      @next()
    return
# local ShopAdminController
ShopAdminController = @ShopAdminController

#For Printing. No Layout
@PrintController = RouteController.extend
  onBeforeAction: () ->
    # could check for roles here for dashboard access
    unless ReactionCore.hasPermission(@route.getName()) and Meteor.userId()
      @render('unauthorized')
    else
      @next()
    return
#Local PrintController
PrintController = @PrintController


###
# General Route Declarations
###
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
    template: 'shopSettings'
    data: ->
      Shops.findOne()

  @route 'dashboard/settings/account',
    controller: ShopAdminController
    path: '/dashboard/settings/account'
    template: 'shopAccounts'

  # list page of customer records
  @route 'dashboard/customers',
    controller: ShopAdminController

  # list page of shop orders
  @route 'dashboard/orders',
    controller: ShopAdminController
    path: 'dashboard/orders/:_id?'
    template: 'orders'
    data: ->
      if Orders.findOne(@params._id)
        return ReactionCore.Collections.Orders.findOne({'_id': @params._id})

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
      @subscribe 'product', @params._id
    onBeforeAction: ->
      variant = @params.variant || @params.query.variant
      setProduct @params._id, variant
      @next()
    data: ->
      product = selectedProduct()
      if @ready() and product
        unless product.isVisible
          unless ReactionCore.hasPermission(@url)
            @render 'unauthorized'
        return product
      if @ready() and !product
        @render 'notFound'

  #checkout
  @route 'cartCheckout',
    layoutTemplate: "coreLayout"
    path: 'checkout',
    template: 'cartCheckout'
    yieldTemplates:
      checkoutHeader:
        to: "layoutHeader"
    waitOn: ->
      @subscribe "Packages"
    subscriptions: ->
      @subscribe "products"
      @subscribe "shipping"
      @subscribe "accountOrders", Session.get("sessionId"), Meteor.userId()

  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id'
    template: 'cartCompleted'
    subscriptions: ->
      @subscribe "accountOrders", Session.get("sessionId"), Meteor.userId()
    data: ->
      if @ready()
        if Orders.findOne(@params._id)
          return ReactionCore.Collections.Orders.findOne({'_id': @params._id})
        else
          @render 'unauthorized'
      else
        @render "loading"

  #account profile
  @route 'account/profile',
    controller: ShopController
    path: 'account/profile'
    template: 'accountProfile'
    subscriptions: ->
      @subscribe "accountOrders", Session.get("sessionId"), Meteor.userId()
    data: ->
      if @ready()
        if Orders.findOne() or Meteor.userId()
          # if subscription has results or Meteor userId
          return ReactionCore.Collections.Orders.find({}, {sort: { createdAt: -1 }})
        else
          @render 'unauthorized'
      else
        @render "loading"
  #route for PDF pages. No layout
  @route 'dashboard/pdf/orders',
    controller: PrintController
    path: 'dashboard/pdf/orders/:_id'
    template: 'completedPDFLayout'
    data: ->
      if Orders.findOne(@params._id)
        return ReactionCore.Collections.Orders.findOne({'_id': @params._id})
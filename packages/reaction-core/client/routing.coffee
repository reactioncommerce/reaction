###
# Helper method to set default/parameterized product variant
###
setCurrentVariant = (product, variantId) ->
  if product
    #parameter set variant
    if variantId
      for variant in product.variants
        if variant._id is variantId
          currentProduct.set "variant",variant
    else
      #preserve current variant for current product
      if currentProduct.equals("variant")
        current = (variant for variant in product.variants when variant._id is currentProduct.equals("variant")._id)[0]
        if current then return
      #default to top variant
      variants = (variant for variant in product.variants when not variant.parentId )
      currentProduct.set "variant", variants[0]


setCurrentProduct = (productId, variant) ->
  if productId.match  /^[A-Za-z0-9]{17}$/
    product = Products.findOne(productId)
    unless currentProduct.get "product" is product
      currentProduct.set "product", product
      setCurrentVariant product,variant
  else
    product =  Products.findOne({handle: { $regex : productId, $options:"i" } })
    unless currentProduct.get "product" is product
      currentProduct.set "product", product
      setCurrentVariant product,variant
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
  onBeforeAction: 'loading'
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
      @subscribe "products"
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
          return tag: Tags.findOne({slug: @params._id.toLowerCase() })

    onAfterAction: ->
      document.title = this.data()?.tag.name || Shops.findOne()?.name

  # product view / edit page
  @route 'product',
    controller: ShopController
    path: 'product/:_id/:variant?'
    template: 'productDetail'
    waitOn: ->
      setCurrentProduct @params._id, @params.variant
      return Meteor.subscribe 'product', @params._id
    onBeforeAction: "loading"
    data: ->
      if @ready() and currentProduct.get("product")
        unless currentProduct.get("product").isVisible
          unless Meteor.app.hasPermission(@path)
            @render 'unauthorized'
            Meteor.setTimeout (->
              Router.go('/')
            ),0
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

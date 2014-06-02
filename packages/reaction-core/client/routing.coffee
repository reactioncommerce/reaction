Router.configure
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  fastRender: true
  onRun: ->
    Meteor.app.init()
  waitOn: ->
    @subscribe "shops"
    @subscribe "cart", Session.get "sessionId", Meteor.userId()
  onBeforeAction: ->
    Alerts.removeSeen()
    return

@ShopController = RouteController.extend
  fastRender: true
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
    data: ->
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
      if @params._id.match  /^[A-Za-z0-9]{17}$/
        product = Products.findOne(@params._id)
      else
        text = @params._id.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
        product = Products.findOne({handle: { $regex : text, $options:"i" } })

      # set current variant and products
      currentProduct.set "product", product
      if product?.variants
        if @params.variant
          for variant in product.variants
            if variant._id is @params.variant
              currentProduct.set "variant",variant
        else
          if product.variants
            currentProduct.set "variant", product.variants[0]


    onBeforeAction: (pause) ->
      if @params._id.match  /^[A-Za-z0-9]{17}$/
        product = Products.findOne(@params._id)
      else
        text = @params._id.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
        product = Products.findOne({handle: { $regex : text, $options:"i" } })
      unless product?.isVisible
        unless Meteor.app.hasPermission(@path)
          @render('unauthorized')
          pause()
    data: ->
      currentProduct.get "product"
    onAfterAction: ->
       document.title = this.data()?.title || Shops.findOne()?.name

  #checkout
  @route 'cartCheckout',
    layoutTemplate: "layout"
    path: 'checkout',
    template: 'cartCheckout'
    yieldTemplates:
      checkoutHeader:
        to: "layoutHeader"
    data: ->
      Cart.findOne()
    onAfterAction: ->
      document.title = Shops.findOne()?.name + " Checkout"

  #completed orders
  @route 'cartCompleted',
    controller: ShopController
    path: 'completed/:_id',
    template: 'cartCompleted'
    data: ->
      Orders.findOne(@params._id)
    onAfterAction: ->
      document.title = Shops.findOne()?.name + " Success"

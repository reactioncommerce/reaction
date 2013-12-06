ShopController = RouteController.extend
  yieldTemplates:
    'shopHeader': to: 'header'
    'dashboardSidebar': to: 'sidebar'
  before: ->
# should we make it a default as Router.before?
    @subscribe('shops').wait()
    shop = Shops.findOne()
    unless shop
      @render('shopNotFound')
      @stop()
    else
      packageShop.shopId = shop._id

ShopAdminController = ShopController.extend
  before: ->
    if packageShop.shopId
      user = Meteor.user()
      unless Roles.userIsInRole(user, 'admin')
        unless ShopRoles.userIsInRole(packageShop.shopId, user, ['owner', 'manager', 'vendor'])
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
      shop: Shops.findOne packageShop.shopId
    template: 'settingsGeneral'
  @route 'shop/settings/account',
    controller: ShopAdminController
    path: '/shop/settings/account'
    data: ->
      shop: Shops.findOne packageShop.shopId
      members: Meteor.users.find {'shopRoles.shopId': packageShop.shopId}
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
    data: ->
      Session.set('currentProductId', @params._id)
      Products.findOne(@params._id)
    template: 'productsEdit'
  #add new products
  @route 'shop/product/add',
    controller: ShopAdminController
    path: '/shop/products/add'
    template: 'productsEdit'
  #checkout
  @route 'shoppingCartCheckout',
    path: 'checkout',
    template: 'shoppingCartCheckout'

# *****************************************************
# Define route for reaction-dashboard
# *****************************************************
ShopController = RouteController.extend
  yieldTemplates:
    'shopHeader': to: 'header'
    'dashboardSidebar': to: 'sidebar'
    'siteFooter': to: 'footer'
  before: ->
# should we make it a default as Router.before?
    @subscribe('shops').wait()
    shop = Shops.findOne()
    unless shop
      @render('loading')
      @stop()
    else
      Meteor.app.init shop

ShopAdminController = ShopController.extend
  before: ->
    unless Meteor.app.hasPermission(@route.name)
      @render('unauthorized')
      @stop()

Router.map ->
  this.route 'dashboard'
  controller: ShopAdminController
  template: 'dashboard'
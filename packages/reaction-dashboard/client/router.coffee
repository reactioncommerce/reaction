# *****************************************************
# Define route for reaction-dashboard
# *****************************************************
DashboardController = RouteController.extend
  before: ->
    @subscribe('shops').wait()
    currentShop = Shops.findOne()
    if currentShop
      Session.set('currentShopId', currentShop._id)
      user = Meteor.user()
      unless Roles.userIsInRole(user, 'admin')
        unless ShopRoles.userIsInRole(Session.get('currentShopId'), user, ['owner', 'manager', 'vendor'])
          this.render('unauthorized')
          this.stop()

Router.map ->
  controller: DashboardController
  this.route 'dashboard'
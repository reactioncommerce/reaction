Deps.autorun ->
  currentShopId = Session.get('currentShopId')
  Meteor.subscribe 'products', currentShopId
  Meteor.subscribe 'orders', currentShopId
  Meteor.subscribe 'customers', currentShopId

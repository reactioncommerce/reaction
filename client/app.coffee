Meteor.app = _.extend(Meteor.app || {},
  getCurrentShopCursor: () ->
    Shops.find({}, {limit: 1});
  getCurrentShop: () ->
    cursor = Meteor.app.getCurrentShopCursor()
    cursor.fetch()[0]
)

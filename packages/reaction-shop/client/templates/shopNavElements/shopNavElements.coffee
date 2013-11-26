# *****************************************************
# general helper to count data for nav badges
# returns int
# *****************************************************
Template.shopNavElements.helpers
  pcount: ->
    Products.find({shopId:Session.get('currentShopId')}).count()
  ocount: ->
    Orders.find({shopId:Session.get('currentShopId')}).count()
  ccount: ->
    Customers.find({shopId:Session.get('currentShopId')}).count()
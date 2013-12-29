# *****************************************************
# general helper to count data for nav badges
# returns int
# *****************************************************
Template.shopNavElements.helpers
  pcount: ->
    Products.find().count()
  ocount: ->
    Orders.find().count()
  ccount: ->
    Customers.find().count()

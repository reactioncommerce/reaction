Template["reaction-commerce-widget"].helpers
  pcount: ->
    Products.find().count()

  ocount: ->
    Orders.find().count()

  ccount: ->
    Customers.find().count()


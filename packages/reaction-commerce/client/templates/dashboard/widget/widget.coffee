Template["reaction-commerce-widget"].helpers
  pcount: ->
    Products.find().count()

  ocount: ->
    Orders.find().count()

  avgOrder: ->
    circleData =
      text: 32.12
      percent: 73
    circleData


  dayOrderTotal: ->
    circleData =
      text: 44
      percent: 33
    circleData


Template["reaction-commerce-widget"].rendered = ->
  $('#shop-orders-circle').circliful()
  $('#shop-products-circle').circliful()
  $('#shop-avg-orders-circle').circliful()
  $('#shop-day-orders-totals-circle').circliful()

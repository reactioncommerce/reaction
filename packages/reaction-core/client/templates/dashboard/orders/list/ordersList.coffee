Template.dashboardOrdersList.helpers
  orders: ->
    return ReactionCore.Collections.Orders.find({}, {sort: { createdAt: -1 }})
  orderAge: ->
    return moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking

  shopName: (shopId)->
    shop = Shops.findOne(@shopId)
    return shop?.name

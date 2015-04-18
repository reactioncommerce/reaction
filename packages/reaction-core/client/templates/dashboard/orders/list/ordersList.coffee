Template.dashboardOrdersList.helpers
  orders: (data) ->
    if data.hash.data
      return data.hash.data
    else
      return ReactionCore.Collections.Orders.find({}, {sort: { createdAt: -1 }, limit:25})
  orderAge: ->
    return moment(@.createdAt).fromNow()

  shipmentTracking: ->
    @.shipping.shipmentMethod.tracking

  shopName: (shopId)->
    shop = Shops.findOne(@shopId)
    return shop?.name

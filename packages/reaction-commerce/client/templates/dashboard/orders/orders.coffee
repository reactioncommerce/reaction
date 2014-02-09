Template.orders.helpers
  orders: () ->
    Orders.find()
  ###
  # defines fulfillment workflow, which can be customized
  ###
  fulfillmentWorkflow: () ->
    newOrdersCount = Orders.find({status: "new"}).count()
    servicingOrdersCount = Orders.find({status: "servicing"}).count()
    packedOrdersCount = Orders.find({status: "packed"}).count()
    shippedOrdersCount = Orders.find({status: "shipped"}).count()

    fulfillmentWorkflow = [
      { value: "servicing", label: "CM", count: servicingOrdersCount }
      { value: "new", title: "NEW", next: "new", count: newOrdersCount }
      { value: "packed", title: "PICK N PACK", next: "shipped", count: packedOrdersCount  }
      { value: "shipped", label: "SHIPPED", count: shippedOrdersCount }

    ]
    fulfillmentWorkflow

Template.orderDetail.helpers
  userProfile: () ->
    userId =  @.userId
    Meteor.subscribe "UserProfile",userId
    Users.findOne userId

  orderAge: () ->
    moment(@.createdAt).fromNow()

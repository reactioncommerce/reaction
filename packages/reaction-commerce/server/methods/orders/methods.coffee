Meteor.methods
  addTracking: (orderId,tracking,variantId) ->
    Orders.update(orderId, {$set: {"shipping.shipmentMethod.tracking":tracking}})
    #Meteor.call "updateWorkflow", orderId

  updateWorkflow: (orderId,currentState) ->
    Orders.update(orderId, {$set: {"state":currentState}})
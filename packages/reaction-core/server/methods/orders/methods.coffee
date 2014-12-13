Meteor.methods
  ###
  # Adds tracking information to order
  # Call after any tracking code is generated
  ###
  addTracking: (orderId, tracking, variantId) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    return Orders.update(orderId, {$set: {"shipping.shipmentMethod.tracking":tracking}})

  ###
  # Save supplied order workflow state
  ###
  updateWorkflow: (orderId, currentState) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    Orders.update(orderId, {$set: {"state":currentState}})
    return Meteor.call "updateHistory", orderId, currentState

  ###
  # Add files/documents to order
  # use for packing slips, labels, customs docs, etc
  ###
  updateDocuments: (orderId, docId, docType) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    return Orders.update orderId,
      $addToSet:
        "documents":
          docId: docId
          docType: docType
  ###
  # Add to order event history
  ###
  updateHistory: (orderId, event, value) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    return Orders.update orderId,
      $addToSet:
        "history":
          event: event
          value: value
          userId: Meteor.userId()
          updatedAt: new Date()

  ###
  # Finalize any payment where mode is "authorize"
  # and status is "approved", reprocess as "sale"
  ###
  processPayments: (orderId) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    order = Orders.findOne(orderId)
    for paymentMethod,index in order.payment.paymentMethod
      if paymentMethod.mode is 'authorize' and paymentMethod.status is 'approved'
        Meteor[paymentMethod.processor].capture paymentMethod.transactionId, paymentMethod.amount, (error,result) ->
          if result.capture?
            transactionId = paymentMethod.transactionId
            Orders.update { "_id": orderId, "payment.paymentMethod.transactionId": transactionId},
              $set: {
                "payment.paymentMethod.$.transactionId": result.capture.id
                "payment.paymentMethod.$.mode": "capture"
                "payment.paymentMethod.$.status": "completed"
              }
          return
    return

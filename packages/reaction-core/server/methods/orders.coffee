Meteor.methods
  ###
  # Adds tracking information to order
  # Call after any tracking code is generated
  ###
  addTracking: (orderId, tracking) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    check tracking, String
    #update tracking
    return Orders.update(orderId, {$set: {"shipping.shipmentMethod.tracking":tracking}})

  ###
  # adds email to existing order
  ###
  addOrderEmail: (orderId, email) ->
    check orderId, String #at least make sure it's an ID and not a sneaky selector
    check email, String
    #TODO: regex email, update Accounts email with matching sessionId
    return Orders.update(orderId, {$set: {"email":email}})

  ###
  # Save supplied order workflow state
  ###
  updateWorkflow: (orderId, currentState) ->
    check orderId, String
    check currentState, String
    # update order status
    Orders.update(orderId, {$set: {"state":currentState}})
    return Meteor.call "updateHistory", orderId, currentState

  ###
  # Add files/documents to order
  # use for packing slips, labels, customs docs, etc
  ###
  updateDocuments: (orderId, docId, docType) ->
    check orderId, String
    check docId, String
    check docType, String
    #update docs
    return Orders.update orderId,
      $addToSet:
        "documents":
          docId: docId
          docType: docType
  ###
  # Add to order event history
  ###
  updateHistory: (orderId, event, value) ->
    check orderId, String
    check event, String
    check value, Match.Optional(String)
    # update history
    return Orders.update orderId,
      $addToSet:
        "history":
          event: event
          value: value
          userId: Meteor.userId()
          updatedAt: new Date()

  ###
  # Finalize any payment where mode is "authorize"
  # and status is "approved", reprocess as "capture"
  # TODO: add tests working with new payment methods
  # TODO: refactor to use non Meteor.namespace
  ###
  processPayments: (orderId) ->
    check orderId, String
    # process payment
    order = Orders.findOne(orderId)
    for paymentMethod,index in order.payment.paymentMethod
      if paymentMethod.mode is 'authorize' and paymentMethod.status is 'approved' and paymentMethod.processor
        Meteor[paymentMethod.processor].capture paymentMethod.transactionId, paymentMethod.amount, (error,result) ->
          if result.capture?
            transactionId = paymentMethod.transactionId
            Orders.update { "_id": orderId, "payment.paymentMethod.transactionId": transactionId},
              $set: {
                "payment.paymentMethod.$.transactionId": result.capture.id
                "payment.paymentMethod.$.mode": "capture"
                "payment.paymentMethod.$.status": "completed"
              }
          else
            throw new Meteor.Error("Failed to capture transaction")
            ReactionCore.Events.warn "Failed to capture transaction.", order, paymentMethod.transactionId
          return
    return

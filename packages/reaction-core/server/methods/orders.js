/**
* Reaction Order Methods
*/
Meteor.methods({

  /*
   * Adds tracking information to order
   * Call after any tracking code is generated
   */
  addTracking: function(orderId, tracking) {
    check(orderId, String);
    check(tracking, String);
    return Orders.update(orderId, {
      $set: {
        "shipping.shipmentMethod.tracking": tracking
      }
    });
  },

  /*
   * adds email to existing order
   */
  addOrderEmail: function(orderId, email) {
    check(orderId, String);
    check(email, String);
    return Orders.update(orderId, {
      $set: {
        "email": email
      }
    });
  },

  /*
   * Save supplied order workflow state
   */
  updateWorkflow: function(orderId, currentState) {
    check(orderId, String);
    check(currentState, String);
    Orders.update(orderId, {
      $set: {
        "state": currentState
      }
    });
    return Meteor.call("updateHistory", orderId, currentState);
  },

  /*
   * Add files/documents to order
   * use for packing slips, labels, customs docs, etc
   */
  updateDocuments: function(orderId, docId, docType) {
    check(orderId, String);
    check(docId, String);
    check(docType, String);
    return Orders.update(orderId, {
      $addToSet: {
        "documents": {
          docId: docId,
          docType: docType
        }
      }
    });
  },

  /*
   * Add to order event history
   */
  updateHistory: function(orderId, event, value) {
    check(orderId, String);
    check(event, String);
    check(value, Match.Optional(String));
    return Orders.update(orderId, {
      $addToSet: {
        "history": {
          event: event,
          value: value,
          userId: Meteor.userId(),
          updatedAt: new Date()
        }
      }
    });
  },

  /*
   * Finalize any payment where mode is "authorize"
   * and status is "approved", reprocess as "capture"
   * TODO: add tests working with new payment methods
   * TODO: refactor to use non Meteor.namespace
   */
  processPayments: function(orderId) {
    var index, order, paymentMethod, _i, _len, _ref;
    check(orderId, String);
    order = Orders.findOne(orderId);
    _ref = order.payment.paymentMethod;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      paymentMethod = _ref[index];
      if (paymentMethod.mode === 'authorize' && paymentMethod.status === 'approved' && paymentMethod.processor) {
        Meteor[paymentMethod.processor].capture(paymentMethod.transactionId, paymentMethod.amount, function(error, result) {
          var transactionId;
          if (result.capture != null) {
            transactionId = paymentMethod.transactionId;
            Orders.update({
              "_id": orderId,
              "payment.paymentMethod.transactionId": transactionId
            }, {
              $set: {
                "payment.paymentMethod.$.transactionId": result.capture.id,
                "payment.paymentMethod.$.mode": "capture",
                "payment.paymentMethod.$.status": "completed"
              }
            });
          } else {
            throw new Meteor.Error("Failed to capture transaction");
            ReactionCore.Events.warn("Failed to capture transaction.", order, paymentMethod.transactionId);
          }
        });
      }
    }
  }
});

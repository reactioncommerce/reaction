/**
 * Reaction Order Methods
 */
Meteor.methods({
  // shipmentTracking
  "orders/shipmentTracking": (order, tracking) => {
    check(order, Object);
    check(tracking, String);
    this.unblock();

    var orderId;
    check(order, Object);
    check(tracking, String);
    orderId = order._id;
    Meteor.call("orders/addTracking", orderId, tracking);
    Meteor.call("orders/updateHistory", orderId, "Tracking Added", tracking);
    return Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow",
      "coreShipmentTracking", order._id);
  },

  // shipmentPrepare
  "orders/documentPrepare": (order) => {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreOrderDocuments", order._id);
    }
  },

  // shipmentPacking
  "orders/shipmentPacking": (order) => {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentPacking", order._id);
    }
    return this.processPayment(order);
  },

  // processPayment
  "orders/processPayment": (order) => {
    check(order, Object);
    this.unblock();

    return Meteor.call("orders/processPayments", order._id, function (error,
      result) {
      if (result) {
        return Meteor.call("workflow/pushOrderWorkflow",
          "coreOrderWorkflow", "coreProcessPayment", order._id);
      }
    });
  },

  // shipmentShipped
  "orders/shipmentShipped": (order) => {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentShipped", order._id);
    }
    return this.orderCompleted(order);
  },
  // orderCompleted
  "orders/orderCompleted": (order) => {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreOrderCompleted", order._id);
    }
  },
  /*
   * Adds tracking information to order
   * Call after any tracking code is generated
   */
  "orders/addTracking": (orderId, tracking) =>  {
    check(orderId, String);
    check(tracking, String);
    return ReactionCore.Collections.Orders.update(orderId, {
      $set: {
        "shipping.shipmentMethod.tracking": tracking
      }
    });
  },

  /*
   * adds email to existing order
   */
  "orders/addOrderEmail": (orderId, email) => {
    check(orderId, String);
    check(email, String);
    return ReactionCore.Collections.Orders.update(orderId, {
      $set: {
        email: email
      }
    });
  },

  /*
   * Add files/documents to order
   * use for packing slips, labels, customs docs, etc
   */
  "orders/updateDocuments": (orderId, docId, docType) => {
    check(orderId, String);
    check(docId, String);
    check(docType, String);
    return ReactionCore.Collections.Orders.update(orderId, {
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
  "orders/updateHistory": (orderId, event, value) => {
    check(orderId, String);
    check(event, String);
    check(value, Match.Optional(String));
    return ReactionCore.Collections.Orders.update(orderId, {
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
   * adjust inventory when an order is placed
   */
  "orders/inventoryAdjust": (orderId) => {
    check(orderId, String);
    var order = ReactionCore.Collections.Orders.findOne(orderId);

    _.each(order.items, function (product) {
      ReactionCore.Collections.Products.update({
        _id: product.productId,
        "variants._id": product.variants._id
      }, {
        $inc: {
          "variants.$.inventoryQuantity": -product.quantity
        }
      });
    });
  },

  /*
   * Finalize any payment where mode is "authorize"
   * and status is "approved", reprocess as "capture"
   * TODO: add tests working with new payment methods
   * TODO: refactor to use non Meteor.namespace
   */
  "orders/processPayments": (orderId) => {
    check(orderId, String);

    var order = ReactionCore.Collections.Orders.findOne(orderId);

    // process order..payment.paymentMethod
    _.each(order.payment.paymentMethod, function (paymentMethod) {
      if (paymentMethod.mode === 'authorize' && paymentMethod.status ===
        'approved' && paymentMethod.processor) {
        Meteor[paymentMethod.processor].capture(paymentMethod.transactionId,
          paymentMethod.amount,
          function (error, result) {
            var transactionId;

            if (result.capture) {
              transactionId = paymentMethod.transactionId;
              ReactionCore.Collections.Orders.update({
                "_id": orderId,
                "payment.paymentMethod.transactionId": transactionId
              }, {
                $set: {
                  "payment.paymentMethod.$.transactionId": result
                    .capture.id,
                  "payment.paymentMethod.$.mode": "capture",
                  "payment.paymentMethod.$.status": "completed"
                }
              });

            } else {
              ReactionCore.Log.warn(
                "Failed to capture transaction.", order,
                paymentMethod.transactionId);
              throw new Meteor.Error(
                "Failed to capture transaction");
            }
          });

      }

    });
  }
});

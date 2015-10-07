/**
 * Reaction Order Methods
 */
Meteor.methods({
  /**
   * orders/shipmentTracking
   * @summary wraps addTracking and triggers workflow update
   * @param {Object} order - order Object
   * @param {String} tracking - tracking number to add to order
   * @returns {String} returns workflow update result
   */
  "orders/shipmentTracking": function (order, tracking) {
    check(order, Object);
    check(tracking, String);
    this.unblock();
    let orderId = order._id;

    Meteor.call("orders/addTracking", orderId, tracking);
    Meteor.call("orders/updateHistory", orderId, "Tracking Added",
      tracking);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow",
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
  /**
   * orders/shipmentPacking
   *
   * @summary trigger packing status
   * @param {Object} order - order object
   * @return {Object} return workflow result
   */
  "orders/shipmentPacking": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentPacking", order._id);
    }
  },
  /**
   * orders/processPayment
   *
   * @summary trigger processPayment and workflow update
   * @param {Object} order - order object
   * @return {Object} return this.processPayment result
   */
  "orders/processPayment": function (order) {
    check(order, Object);
    this.unblock();

    return Meteor.call("orders/processPayments", order._id, function (
      error,
      result) {
      if (result) {
        Meteor.call("workflow/pushOrderWorkflow",
          "coreOrderWorkflow", "coreProcessPayment", order._id);
        return this.processPayment(order);
      }
    });
  },
  /**
   * orders/shipmentShipped
   *
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @return {Object} return workflow result
   */
  "orders/shipmentShipped": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentShipped", order._id);
    }
  },
  /**
   * orders/orderCompleted
   *
   * @summary trigger orderCompleted status and workflow update
   * @param {Object} order - order object
   * @return {Object} return this.orderCompleted result
   */
  "orders/orderCompleted": function (order) {
    check(order, Object);
    this.unblock();

    if (order) {
      Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreOrderCompleted", order._id);
      return this.orderCompleted(order);
    }
  },
  /**
   * orders/addTracking
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} tracking - tracking id
   * @return {String} returns order update result
   */
  "orders/addTracking": function (orderId, tracking) {
    check(orderId, String);
    check(tracking, String);
    return ReactionCore.Collections.Orders.update(orderId, {
      $addToSet: {
        "shipping.shipmentMethod.tracking": tracking
      }
    });
  },

  /**
   * orders/addShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} data - tracking id
   * @return {String} returns order update result
   */
  "orders/addShipment": function (orderId, data) {
    check(orderId, String);
    check(data, Object);

    // temp hack until we build out multiple payment handlers
    let cart = ReactionCore.Collections.Cart.findOne(cartId);
    let shippingId = "";
    if (cart.shipping) {
      shippingId = cart.shipping[0]._id;
    }

    return ReactionCore.Collections.Orders.update({
      "_id": orderId,
      "shipping._id": shippingId
    }, {
      $addToSet: {
        "shipping.shipments": data
      }
    });
  },

  /**
   * orders/updateShipmentTracking
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentId - shipmentId
   * @param {String} tracking - add tracking to orderId
   * @return {String} returns order update result
   */
  "orders/updateShipmentTracking": function (orderId, shipmentId, tracking) {
    check(orderId, String);
    check(shipmentId, String);
    check(tracking, String);

    return ReactionCore.Collections.Orders.update({
      "_id": orderId,
      "shipping._id": shipmentId
    }, {
      $set: {
        [`shipping.$.tracking`]: tracking
      }
    });
  },

  "orders/updateOrder": function (order, shipmentId, item) {
    check(order, Object);
    check(shipmentId, String);
    check(item, Object);

    return ReactionCore.Collections.Orders.update({
      "_id": order._id,
      "shipping._id": shipmentId
    }, {
      $push: {
        [`shipping.$.items`]: item
      }
    });
  },

  "orders/updateShipmentItem": function (orderId, shipmentId, item) {
    check(orderId, String);
    check(shipmentId, Number);
    check(item, Object);

    return ReactionCore.Collections.Orders.update({
      "_id": orderId,
      "shipments._id": shipmentId
    }, {
      $addToSet: {
        "shipment.$.items": shipmentIndex
      }
    });
  },

  /**
   * orders/addShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentIndex - shipmentIndex
   * @return {String} returns order update result
   */
  "orders/removeShipment": function (orderId, shipmentIndex) {
    check(orderId, String);
    check(shipmentIndex, Number);
    ReactionCore.Collections.Orders.update(orderId, {
      $unset: {
        [`shipments.${shipmentIndex}`]: 1
      }
    });
    return ReactionCore.Collections.Orders.update(orderId, {
      $pull: {
        shipments: null
      }
    });
  },

  /**
   * orders/addOrderEmail
   * @summary Adds email to order, used for guest users
   * @param {String} orderId - add tracking to orderId
   * @param {String} email - valid email address
   * @return {String} returns order update result
   */
  "orders/addOrderEmail": function (orderId, email) {
    check(orderId, String);
    check(email, String);
    return ReactionCore.Collections.Orders.update(orderId, {
      $set: {
        email: email
      }
    });
  },
  /**
   * orders/addOrderEmail
   * @summary Adds file, documents to order. use for packing slips, labels, customs docs, etc
   * @param {String} orderId - add tracking to orderId
   * @param {String} docId - CFS collection docId
   * @param {String} docType - CFS docType
   * @return {String} returns order update result
   */
  "orders/updateDocuments": function (orderId, docId, docType) {
    check(orderId, String);
    check(docId, String);
    check(docType, String);
    return ReactionCore.Collections.Orders.update(orderId, {
      $addToSet: {
        documents: {
          docId: docId,
          docType: docType
        }
      }
    });
  },

  /**
   * orders/updateHistory
   * @summary adds order history item for tracking and logging order updates
   * @param {String} orderId - add tracking to orderId
   * @param {String} event - workflow event
   * @param {String} value - event value
   * @return {String} returns order update result
   */
  "orders/updateHistory": function (orderId, event, value) {
    check(orderId, String);
    check(event, String);
    check(value, Match.Optional(String));
    return ReactionCore.Collections.Orders.update(orderId, {
      $addToSet: {
        history: {
          event: event,
          value: value,
          userId: Meteor.userId(),
          updatedAt: new Date()
        }
      }
    });
  },

  /**
   * orders/inventoryAdjust
   * adjust inventory when an order is placed
   * @param {String} orderId - add tracking to orderId
   * @return {null} no return value
   */
  "orders/inventoryAdjust": function (orderId) {
    check(orderId, String);
    let order = ReactionCore.Collections.Orders.findOne(orderId);

    _.each(order.items, function (product) {
      ReactionCore.Collections.Products.update({
        "_id": product.productId,
        "variants._id": product.variants._id
      }, {
        $inc: {
          "variants.$.inventoryQuantity": -product.quantity
        }
      });
    });
    return;
  },

  /**
   * orders/capturePayments
   * @summary Finalize any payment where mode is "authorize"
   * and status is "approved", reprocess as "capture"
   * @todo: add tests working with new payment methods
   * @todo: refactor to use non Meteor.namespace
   * @param {String} orderId - add tracking to orderId
   * @return {null} no return value
   */
  "orders/capturePayments": (orderId) => {
    check(orderId, String);

    let order = ReactionCore.Collections.Orders.findOne(orderId);

    // process order..payment.paymentMethod
    _.each(order.payment.paymentMethod, function (paymentMethod) {
      if (paymentMethod.mode === "authorize" && paymentMethod.status ===
        "approved" && paymentMethod.processor) {
        Meteor[paymentMethod.processor].capture(paymentMethod.transactionId,
          paymentMethod.amount,
          function (error, result) {
            let transactionId;

            if (result.capture) {
              transactionId = paymentMethod.transactionId;
              ReactionCore.Collections.Orders.update({
                "_id": orderId,
                "billing.paymentMethod.transactionId": transactionId
              }, {
                $set: {
                  "payment.paymentMethod.$.transactionId": result
                    .capture.id,
                  "billing.paymentMethod.$.mode": "capture",
                  "billing.paymentMethod.$.status": "completed"
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

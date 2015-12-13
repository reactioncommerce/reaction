
let Future = Npm.require("fibers/future");

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
   * orders/shipmentPacked
   *
   * @summary update packing status
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @param {Boolean} packed - packed status
   * @return {Object} return workflow result
   */
  "orders/shipmentPacked": function (order, shipment, packed) {
    check(order, Object);
    check(shipment, Object);
    check(packed, Boolean);
    this.unblock();

    if (order) {
      ReactionCore.Collections.Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.packed": packed
        }
      });

      return Meteor.call(
        "workflow/pushOrderShipmentWorkflow",
        "coreOrderShipmentWorkflow",
        "coreOrderPacking",
        order._id,
        shipment._id
      );
    }
  },

  /**
   * orders/makeAdjustmentsToInvoice
   *
   * @summary Update the status of an invoice to allow adjustments to be made
   * @param {Object} order - order object
   * @return {Object} Mongo update
   */
  "orders/makeAdjustmentsToInvoice": function (order) {
    check(order, Object);
    this.unblock();

    return ReactionCore.Collections.Orders.update(order._id, {
      $set: {
        "billing.0.paymentMethod.status": "adjustments"
      }
    });
  },

  /**
   * orders/approvePayment
   *
   * @summary Approve payment and apply any adjustments
   * @param {Object} order - order object
   * @param {Number} discount - Amount of the discount, as a positive number
   * @return {Object} return this.processPayment result
   */
  "orders/approvePayment": function (order, discount) {
    check(order, Object);
    check(discount, Number);
    this.unblock();

    let total =
      order.billing[0].invoice.subtotal
      + order.billing[0].invoice.shipping
      + order.billing[0].invoice.taxes
      - Math.abs(discount);

    return ReactionCore.Collections.Orders.update(order._id, {
      $set: {
        "billing.0.paymentMethod.amount": total,
        "billing.0.paymentMethod.status": "approved",
        "billing.0.paymentMethod.mode": "capture",
        "billing.0.invoice.discounts": discount,
        "billing.0.invoice.total": total
      }
    });
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
      let shipment = order.shipping[0];

      // Attempt to sent email notification
      Meteor.call("orders/sendNotification", order);

      ReactionCore.Collections.Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.shipped": true
        }
      });

      return Meteor.call("workflow/pushOrderWorkflow",
        "coreOrderWorkflow", "coreShipmentShipped", order._id);
    }
  },
  /**
   * orders/shipmentShipped
   *
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @return {Object} return workflow result
   */
  "orders/sendNotification": function (order) {
    check(order, Object);
    this.unblock();
    if (order) {
      let shop = ReactionCore.Collections.Shops.findOne(order.shopId);
      let shipment = order.shipping[0];

      ReactionCore.configureMailUrl();
      ReactionCore.Log.info("orders/sendNotification", order.workflow.status);
      // handle missing root shop email
      if (!shop.emails[0].address) {
        shop.emails[0].address = "no-reply@reactioncommerce.com";
        ReactionCore.Log.warn("No shop email configured. Using no-reply to send mail");
      }
      // anonymous users without emails.
      if (!order.email) {
        ReactionCore.Log.warn("No shop email configured. Using anonymous order.");
        return true;
      }
      // email templates can be customized in Templates collection
      // loads defaults from reaction-email-templates/templates
      let tpl = `orders/${order.workflow.status}`;
      SSR.compileTemplate(tpl, ReactionEmailTemplate(tpl));
      try {
        return Email.send({
          to: order.email,
          from: `${shop.name} <${shop.emails[0].address}>`,
          subject: `Order update from ${shop.name}`,
          html: SSR.render(tpl, {
            homepage: Meteor.absoluteUrl(),
            shop: shop,
            order: order,
            shipment: shipment
          })
        });
      } catch (error) {
        throw new Meteor.Error(403, "Unable to send shipment notification email.", error);
      }
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
   * @param {Object} order - An Order object
   * @param {Object} shipment - A Shipment object
   * @param {String} tracking - tracking id
   * @return {String} returns order update result
   */
  "orders/updateShipmentTracking": function (order, shipment, tracking) {
    check(order, Object);
    check(shipment, Object);
    check(tracking, String);

    return ReactionCore.Collections.Orders.update({
      "_id": order._id,
      "shipping._id": shipment._id
    }, {
      $set: {
        [`shipping.$.tracking`]: tracking
      }
    });
  },

  /**
   * orders/addItemToShipment
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @param {String} orderId - add tracking to orderId
   * @param {String} shipmentId - shipmentId
   * @param {ShipmentItem} item - A ShipmentItem to add to a shipment
   * @return {String} returns order update result
   */
  "orders/addItemToShipment": function (orderId, shipmentId, item) {
    check(orderId, String);
    check(shipmentId, String);
    check(item, Object);

    return ReactionCore.Collections.Orders.update({
      "_id": orderId,
      "shipping._id": shipmentId
    }, {
      $push: {
        "shipping.$.items": item
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
    _.each(order.billing, function (billing) {
      const paymentMethod = billing.paymentMethod;
      const transactionId = paymentMethod.transactionId;

      if (paymentMethod.mode === "capture" && paymentMethod.status === "approved" && paymentMethod.processor) {
        // Grab the amount from the shipment, otherwise use the original amount
        const processor = paymentMethod.processor.toLowerCase();

        Meteor.call(`${processor}/payment/capture`, paymentMethod, (error, result) => {
          if (result.saved === true) {
            const metadata = Object.assign(billing.paymentMethod.metadata || {}, result.metadata || {});

            ReactionCore.Collections.Orders.update({
              "_id": orderId,
              "billing.paymentMethod.transactionId": transactionId
            }, {
              $set: {
                "billing.$.paymentMethod.mode": "capture",
                "billing.$.paymentMethod.status": "completed",
                "billing.$.paymentMethod.metadata": metadata
              },
              $push: {
                "billing.$.paymentMethod.transactions": result
              }
            });
          } else {
            ReactionCore.Log.error("Failed to capture transaction.", order, paymentMethod.transactionId, result.error.stack);

            ReactionCore.Collections.Orders.update({
              "_id": orderId,
              "billing.paymentMethod.transactionId": transactionId
            }, {
              $set: {
                "billing.$.paymentMethod.mode": "capture",
                "billing.$.paymentMethod.status": "error"
              },
              $push: {
                "billing.$.paymentMethod.transactions": result
              }
            });

            return {error: "orders/capturePayments: Failed to capture transaction"};
          }
        });
      }
    });
  },

  /**
   * orders/refund/list
   *
   * @summary Get a list of refunds for a particular payment method.
   * @param {Object} paymentMethod - paymentMethod object
   * @return {null} no return value
   */
  "orders/refunds/list": function (paymentMethod) {
    check(paymentMethod, Object);
    this.unblock();

    let future = new Future();
    const processor = paymentMethod.processor.toLowerCase();

    Meteor.call(`${processor}/refund/list`, paymentMethod, (error, result) => {
      if (error) {
        future.return(error);
      } else {
        future.return(result);
      }
    });

    return future.wait();
  },

  /**
   * orders/refund/create
   *
   * @summary Apply a refund to an already captured order
   * @param {String} orderId - order object
   * @param {Object} paymentMethod - paymentMethod object
   * @param {Number} amount - Amount of the refund, as a positive number
   * @return {null} no return value
   */
  "orders/refunds/create": function (orderId, paymentMethod, amount) {
    check(orderId, String);
    check(paymentMethod, Object);
    check(amount, Number);
    this.unblock();

    const processor = paymentMethod.processor.toLowerCase();
    let order = ReactionCore.Collections.Orders.findOne(orderId);
    let transactionId = paymentMethod.transactionId;

    Meteor.call(`${processor}/refund/create`, paymentMethod, amount, (error, result) => {
      ReactionCore.Collections.Orders.update({
        "_id": orderId,
        "billing.paymentMethod.transactionId": transactionId
      }, {
        $push: {
          "billing.$.paymentMethod.transactions": result
        }
      });

      if (result.saved === false) {
        ReactionCore.Log.warn("Failed to capture transaction.", order, paymentMethod.transactionId);

        throw new Meteor.Error(
          "Failed to capture transaction");
      }
    });
  }
});

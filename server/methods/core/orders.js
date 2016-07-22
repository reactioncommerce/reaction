import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart, Orders, Products, Shops } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";

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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();
    let orderId = order._id;

    Meteor.call("orders/addTracking", orderId, tracking);
    Meteor.call("orders/updateHistory", orderId, "Tracking Added",
      tracking);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow",
      "coreShipmentTracking", order._id);

    // Set the status of the items as shipped
    const itemIds = template.order.shipping[0].items.map((item) => {
      return item._id;
    });

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/tracking", order._id, itemIds);
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    if (order) {
      Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.packed": packed
        }
      });

      // Set the status of the items as shipped
      const itemIds = shipment.items.map((item) => {
        return item._id;
      });

      const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/packed", order, itemIds);
      if (result === 1) {
        return Orders.update({
          "_id": order._id,
          "shipping._id": shipment._id
        }, {
          $set: {
            "shipping.$.packed": packed
          }
        });
      }
      return result;
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    return Orders.update(order._id, {
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    let total =
      order.billing[0].invoice.subtotal
      + order.billing[0].invoice.shipping
      + order.billing[0].invoice.taxes
      - Math.abs(discount);

    return Orders.update(order._id, {
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    return Meteor.call("orders/processPayments", order._id, function (
      error,
      result) {
      if (result) {
        Meteor.call("workflow/pushOrderWorkflow",
          "coreOrderWorkflow", "coreProcessPayment", order._id);

        // Set the status of the items as shipped
        const itemIds = order.shipping[0].items.map((item) => {
          return item._id;
        });

        Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);


        return this.processPayment(order);
      }
    });
  },
  /**
   * orders/shipmentShipped
   *
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @return {Object} return results of several operations
   */
  "orders/shipmentShipped": function (order, shipment) {
    check(order, Object);
    check(shipment, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    let completedItemsResult;
    let completedOrderResult;

    // Attempt to sent email notification
    const notifyResult = Meteor.call("orders/sendNotification", order);

    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    // TODO: In the future, this could be handled by shipping delivery status
    const workflowResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/shipped", order, itemIds);

    if (workflowResult === 1) {
      // Move to completed status for items
      completedItemsResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

      if (completedItemsResult === 1) {
        // Then try to mark order as completed.
        completedOrderResult = Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
      }
    }

    return {
      notifyResult: notifyResult,
      workflowResult: workflowResult,
      completedItems: completedItemsResult,
      completedOrder: completedOrderResult
    };
  },

  /**
   * orders/shipmentDelivered
   *
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @return {Object} return workflow result
   */
  "orders/shipmentDelivered": function (order) {
    check(order, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    if (order) {
      let shipment = order.shipping[0];

      // Attempt to sent email notification
      Meteor.call("orders/sendNotification", order);

      const itemIds = shipment.items.map((item) => {
        return item._id;
      });

      Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/delivered", order._id, itemIds);
      Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order._id, itemIds);

      const isCompleted = _.every(order.items, (item) => {
        return _.includes(item.workflow.workflow, "coreOrderItemWorkflow/completed");
      });

      if (isCompleted === true) {
        Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order._id);
        return true;
      }

      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order._id);

      return false;
    }
  },

  /**
   * orders/sendNotification
   *
   * @summary send order notification email
   * @param {Object} order - order object
   * @return {Boolean} email sent or not
   */
  "orders/sendNotification": function (order) {
    check(order, Object);

    // just make sure this a real userId
    // todo: ddp limit
    if (!Meteor.userId()) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();
    if (order) {
      let shop = Shops.findOne(order.shopId);
      let shipment = order.shipping[0];

      Reaction.configureMailUrl();
      Logger.info("orders/sendNotification", order.workflow.status);
      // handle missing root shop email
      if (!shop.emails[0].address) {
        shop.emails[0].address = "no-reply@reactioncommerce.com";
        Logger.warn("No shop email configured. Using no-reply to send mail");
      }
      // anonymous users without emails.
      if (!order.email) {
        Logger.warn("No shop email configured. Using anonymous order.");
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
        Logger.fatal("Unable to send notification email: " + error);
        throw new Meteor.Error("error-sending-email", "Unable to send order notification email.", error);
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // temp hack until we build out multiple payment handlers
    let cart = Cart.findOne(cartId);
    let shippingId = "";
    if (cart.shipping) {
      shippingId = cart.shipping[0]._id;
    }

    return Orders.update({
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update({
      "_id": order._id,
      "shipping._id": shipment._id
    }, {
      $set: {
        ["shipping.$.tracking"]: tracking
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update({
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update({
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    Orders.update(orderId, {
      $unset: {
        [`shipments.${shipmentIndex}`]: 1
      }
    });
    return Orders.update(orderId, {
      $pull: {
        shipments: null
      }
    });
  },

  /**
   * orders/addOrderEmail
   * @summary Adds email to order, used for guest users
   * @param {String} cartId - add tracking to orderId
   * @param {String} email - valid email address
   * @return {String} returns order update result
   */
  "orders/addOrderEmail": function (cartId, email) {
    check(cartId, String);
    check(email, String);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update({cartId: cartId}, {
      $set: {
        email: email
      }
    });
  },
  /**
   * orders/updateDocuments
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update(orderId, {
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Orders.update(orderId, {
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const order = Orders.findOne(orderId);
    order.items.forEach(item => {
      Products.update({
        _id: item.variants._id
      }, {
        $inc: {
          inventoryQuantity: -item.quantity
        }
      }, { selector: { type: "variant" } });
    });
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let order = Orders.findOne(orderId);
    const itemIds = order.shipping[0].items.map((item) => {
      return item._id;
    });

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

    // process order..payment.paymentMethod
    _.each(order.billing, function (billing) {
      const paymentMethod = billing.paymentMethod;
      const transactionId = paymentMethod.transactionId;

      if (paymentMethod.mode === "capture" && paymentMethod.status === "approved" && paymentMethod.processor) {
        // Grab the amount from the shipment, otherwise use the original amount
        const processor = paymentMethod.processor.toLowerCase();

        Meteor.call(`${processor}/payment/capture`, paymentMethod, (error, result) => {
          if (result && result.saved === true) {
            const metadata = Object.assign(billing.paymentMethod.metadata || {}, result.metadata || {});

            Orders.update({
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
            if (result && result.error) {
              Logger.fatal("Failed to capture transaction.", order, paymentMethod.transactionId, result.error);
            } else {
              Logger.fatal("Failed to capture transaction.", order, paymentMethod.transactionId, error);
            }

            Orders.update({
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

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    let future = new Future();
    const processor = paymentMethod.processor.toLowerCase();

    Meteor.call(`${processor}/refund/list`, paymentMethod, (error, result) => {
      if (error) {
        future.return(error);
      } else {
        check(result, [Schemas.Refund]);
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
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const processor = paymentMethod.processor.toLowerCase();
    let order = Orders.findOne(orderId);
    let transactionId = paymentMethod.transactionId;

    const result = Meteor.call(`${processor}/refund/create`, paymentMethod, amount);
    Orders.update({
      "_id": orderId,
      "billing.paymentMethod.transactionId": transactionId
    }, {
      $push: {
        "billing.$.paymentMethod.transactions": result
      }
    });

    if (result.saved === false) {
      Logger.fatal("Attempt for refund transaction failed", order, paymentMethod.transactionId, result.error);

      throw new Meteor.Error(
        "Attempt to refund transaction failed", result.error);
    }
  }
});

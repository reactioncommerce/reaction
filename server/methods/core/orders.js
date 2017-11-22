import _ from "lodash";
import path from "path";
import moment from "moment";
import accounting from "accounting-js";
import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Media, Orders, Products, Shops, Packages } from "/lib/collections";
import { Logger, Hooks, Reaction } from "/server/api";

/**
 * @file Methods for Orders.
 *
 *
 * @namespace Methods/Orders
*/

/**
 * @name orderCreditMethod
 * @method
 * @memberof Methods/Orders
 * @summary Helper to return the order credit object.
 * Credit paymentMethod on the order as per current active shop
 * @param  {Object} order order object
 * @return {Object} returns entire payment method
 */
export function orderCreditMethod(order) {
  const creditBillingRecords = order.billing.filter(value => value.paymentMethod.method ===  "credit");
  const billingRecord = creditBillingRecords.find((billing) => {
    return billing.shopId === Reaction.getShopId();
  });
  return billingRecord;
}

/**
 * @name orderDebitMethod
 * @method
 * @memberof Methods/Orders
 * @summary Helper to return the order debit object
 * @param  {Object} order order object
 * @return {Pbject} returns entire payment method
 */
export function orderDebitMethod(order) {
  const debitBillingRecords = order.billing.filter(value => value.paymentMethod.method ===  "debit");
  const billingRecord = debitBillingRecords.find((billing) => {
    return billing.shopId === Reaction.getShopId();
  });
  return billingRecord;
}

/**
 * @name ordersInventoryAdjust
 * @method
 * @memberof Methods/Orders
 * @summary Adjust inventory when an order is placed
 * @param {String} orderId - Add tracking to orderId
 * @todo Why are we waiting until someone with orders permissions does something to reduce quantity of
 * ordered items seems like this could cause over ordered items and messed up order quantities pretty easily.
 * @return {null} no return value
 */
export function ordersInventoryAdjust(orderId) {
  check(orderId, String);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const order = Orders.findOne(orderId);
  order.items.forEach(item => {
    Products.update({
      _id: item.variants._id
    }, {
      $inc: {
        inventoryQuantity: -item.quantity
      }
    }, {
      publish: true,
      selector: {
        type: "variant"
      }
    });
  });
}

/**
 * @name ordersInventoryAdjustByShop
 * @method
 * @memberof Methods/Orders
 * @summary Adjust inventory for a particular shop when an order is approved
 * @todo Marketplace: Is there a reason to do this any other way? Can admins reduce for more than one shop?
 * @param {String} orderId - orderId
 * @param {String} shopId - the id of the shop approving the order
 * @return {null} no return value
 */
export function ordersInventoryAdjustByShop(orderId, shopId) {
  check(orderId, String);
  check(shopId, String);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const order = Orders.findOne(orderId);
  order.items.forEach(item => {
    if (item.shopId === shopId) {
      Products.update({
        _id: item.variants._id
      }, {
        $inc: {
          inventoryQuantity: -item.quantity
        }
      }, {
        publish: true,
        selector: {
          type: "variant"
        }
      });
    }
  });
}

/**
 * @name orderQuantityAdjust
 * @method
 * @memberof Methods/Orders
 * @param  {String} orderId      orderId
 * @param  {Object} refundedItem refunded item
 * @return {null} no return value
 */
export function orderQuantityAdjust(orderId, refundedItem) {
  check(orderId, String);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const order = Orders.findOne(orderId);
  order.items.forEach((item) => {
    if (item._id === refundedItem.id) {
      const itemId = item._id;
      const newQuantity = item.quantity - refundedItem.refundedQuantity;

      Orders.update({
        _id: orderId,
        items: { $elemMatch: { _id: itemId } }
      }, { $set:
        { "items.$.quantity": newQuantity }
      }
      );
    }
  });
}

export const methods = {
  /**
   * @name orders/shipmentPicked
   * @method
   * @memberof Methods/Orders
   * @summary update picking status
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @return {Object} return workflow result
   */
  "orders/shipmentPicked": function (order, shipment) {
    check(order, Object);
    check(shipment, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as picked
    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/picked", order, itemIds);
    if (result === 1) {
      return Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/picked"
        }, $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/picked"
        }
      });
    }
    return result;
  },

  /**
   * @name orders/shipmentPacked
   * @method
   * @memberof Methods/Orders
   * @summary update packing status
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @return {Object} return workflow result
   */
  "orders/shipmentPacked": function (order, shipment) {
    check(order, Object);
    check(shipment, Object);

    // REVIEW: who should have permission to do this in a marketplace setting?
    // Do we need to update the order schema to reflect multiple packers / shipments?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as packed
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
          "shipping.$.workflow.status": "coreOrderWorkflow/packed"
        }, $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/packed"
        }
      });
    }
    return result;
  },

  /**
   * @name orders/shipmentLabeled
   * @method
   * @memberof Methods/Orders
   * @summary update labeling status
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @return {Object} return workflow result
   */
  "orders/shipmentLabeled": function (order, shipment) {
    check(order, Object);
    check(shipment, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as labeled
    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/labeled", order, itemIds);
    if (result === 1) {
      return Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/labeled"
        }, $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/labeled"
        }
      });
    }
    return result;
  },

  /**
   * @name orders/makeAdjustmentsToInvoice
   * @method
   * @memberof Methods/Orders
   * @summary Update the status of an invoice to allow adjustments to be made
   * @param {Object} order - order object
   * @return {Object} Mongo update
   */
  "orders/makeAdjustmentsToInvoice": function (order) {
    check(order, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock(); // REVIEW: Why unblock here?

    return Orders.update({
      "_id": order._id,
      "billing.shopId": Reaction.getShopId,
      "billing.paymentMethod.method": "credit"
    }, {
      $set: {
        "billing.$.paymentMethod.status": "adjustments"
      }
    });
  },

  /**
   * @name orders/approvePayment
   * @method
   * @memberof Methods/Orders
   * @summary Approve payment and apply any adjustments
   * @param {Object} order - order object
   * @return {Object} return this.processPayment result
   */
  "orders/approvePayment": function (order) {
    check(order, Object);
    const invoice = orderCreditMethod(order).invoice;

    // REVIEW: Who should have access to do this for a marketplace?
    // Do we have/need a shopId on each order?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock(); // REVIEW: why unblock here?

    // this is server side check to verify
    // that the math all still adds up.
    const shopId = Reaction.getShopId();
    const subTotal = invoice.subtotal;
    const shipping = invoice.shipping;
    const taxes = invoice.taxes;
    const discount = invoice.discounts;
    const discountTotal = Math.max(0, subTotal - discount); // ensure no discounting below 0.
    const total = accounting.toFixed(Number(discountTotal) + Number(shipping) + Number(taxes), 2);

    // Updates flattened inventory count on variants in Products collection
    ordersInventoryAdjustByShop(order._id, shopId);

    return Orders.update({
      "_id": order._id,
      "billing.shopId": shopId,
      "billing.paymentMethod.method": "credit"
    }, {
      $set: {
        "billing.$.paymentMethod.amount": total,
        "billing.$.paymentMethod.status": "approved",
        "billing.$.paymentMethod.mode": "capture",
        "billing.$.invoice.discounts": discount,
        "billing.$.invoice.total": Number(total)
      }
    });
  },

  /**
   * @name orders/cancelOrder
   * @method
   * @memberof Methods/Orders
   * @summary Start the cancel order process
   * @param {Object} order - order object
   * @param {Boolean} returnToStock - condition to return product to stock
   * @return {Object} ret
   */
  "orders/cancelOrder": function (order, returnToStock) {
    check(order, Object);
    check(returnToStock, Boolean);

    // REVIEW: Only marketplace admins should be able to cancel entire order?
    // Unless order is entirely contained in a single shop? Do we need a switch on marketplace owner dashboard?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    if (!returnToStock) {
      ordersInventoryAdjust(order._id);
    }

    const billingRecord = order.billing.find(billing => billing.shopId === Reaction.getShopId());
    const shippingRecord = order.shipping.find(shipping => shipping.shopId === Reaction.getShopId());

    let paymentMethod = orderCreditMethod(order).paymentMethod;
    paymentMethod = Object.assign(paymentMethod, { amount: Number(paymentMethod.amount) });
    const invoiceTotal = billingRecord.invoice.total;
    const shipment = shippingRecord;
    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    // refund payment to customer
    const paymentMethodId = paymentMethod && paymentMethod.paymentPackageId;
    const paymentMethodName = paymentMethod && paymentMethod.paymentSettingsKey;
    const getPaymentMethod = Packages.findOne({ _id: paymentMethodId });
    const isRefundable = getPaymentMethod && getPaymentMethod.settings && getPaymentMethod.settings[paymentMethodName]
      && getPaymentMethod.settings[paymentMethodName].support.includes("Refund");

    if (isRefundable) {
      Meteor.call("orders/refunds/create", order._id, paymentMethod, Number(invoiceTotal));
    }


    // send notification to user
    const prefix = Reaction.getShopPrefix();
    const url = `${prefix}/notifications`;
    const sms = true;
    Meteor.call("notification/send", order.userId, "orderCanceled", url, sms, (err) => {
      if (err) Logger.error(err);
    });

    // update item workflow
    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, itemIds);

    return Orders.update({
      "_id": order._id,
      "billing.shopId": Reaction.getShopId,
      "billing.paymentMethod.method": "credit"
    }, {
      $set: {
        "workflow.status": "coreOrderWorkflow/canceled",
        "billing.$.paymentMethod.mode": "cancel"
      },
      $push: {
        "workflow.workflow": "coreOrderWorkflow/canceled"
      }
    });
  },

  /**
   * @name orders/processPayment
   * @method
   * @memberof Methods/Orders
   * @summary trigger processPayment and workflow update
   * @param {Object} order - order object
   * @return {Object} return this.processPayment result
   */
  "orders/processPayment": function (order) {
    check(order, Object);

    // REVIEW: Who should have access to process payment in marketplace?
    // Probably just the shop owner for now?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    return Meteor.call("orders/processPayments", order._id, function (error, result) {
      if (result) {
        Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", order._id);

        const shippingRecord = order.shipping.find(shipping => shipping.shopId === Reaction.getShopId());
        // Set the status of the items as shipped
        const itemIds = shippingRecord.items.map((item) => {
          return item._id;
        });

        Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

        return this.processPayment(order);
      }
      return false;
    });
  },

  /**
   * @name orders/shipmentShipped
   * @method
   * @memberof Methods/Orders
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @param {Object} shipment - shipment object
   * @return {Object} return results of several operations
   */
  "orders/shipmentShipped": function (order, shipment) {
    check(order, Object);
    check(shipment, Object);

    // TODO: Who should have access to ship shipments in a marketplace setting
    // Should be anyone who has product in an order.
    if (!Reaction.hasPermission("orders")) {
      Logger.error("User does not have 'orders' permissions");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    let completedItemsResult;
    let completedOrderResult;

    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    // TODO: In the future, this could be handled by shipping delivery status
    // REVIEW: This hook seems to run before the shipment has been marked as shipped
    Hooks.Events.run("onOrderShipmentShipped", order, itemIds);
    const workflowResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/shipped", order, itemIds);

    if (workflowResult === 1) {
      // Move to completed status for items
      completedItemsResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

      if (completedItemsResult === 1) {
        // Then try to mark order as completed.
        completedOrderResult = Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
      }
    }

    if (order.email) {
      Meteor.call("orders/sendNotification", order, "shipped");
    } else {
      // TODO: add to order history that no email was sent
      Logger.warn("No order email found. No notification sent.");
    }

    Orders.update({
      "_id": order._id,
      "shipping._id": shipment._id
    }, {
      $set: {
        "shipping.$.workflow.status": "coreOrderWorkflow/shipped"
      }, $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/shipped"
      }
    });

    return {
      workflowResult: workflowResult,
      completedItems: completedItemsResult,
      completedOrder: completedOrderResult
    };
  },

  /**
   * @name orders/shipmentDelivered
   * @method
   * @memberof Methods/Orders
   * @summary trigger shipmentShipped status and workflow update
   * @param {Object} order - order object
   * @return {Object} return workflow result
   */
  "orders/shipmentDelivered": function (order) {
    check(order, Object);

    // REVIEW: this should be callable from the server via callback from Shippo or other webhook
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    const shipment = order.shipping.find(shipping => shipping.shopId === Reaction.getShopId());

    if (order.email) {
      Meteor.call("orders/sendNotification", order, (err) => {
        if (err) {
          Logger.error(err, "orders/shipmentDelivered: Failed to send notification");
        }
      });
    } else {
      Logger.warn("No order email found. No notification sent.");
    }

    const itemIds = shipment.items.map((item) => {
      return item._id;
    });

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/delivered", order, itemIds);
    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

    const isCompleted = order.items.every((item) => {
      return item.workflow.workflow && item.workflow.workflow.includes("coreOrderItemWorkflow/completed");
    });

    Orders.update({
      "_id": order._id,
      "shipping._id": shipment._id
    }, {
      $set: {
        "shipping.$.workflow.status": "coreOrderWorkflow/delivered"
      }, $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/delivered"
      }
    });

    if (isCompleted === true) {
      Hooks.Events.run("onOrderShipmentDelivered", order._id);
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
      return true;
    }

    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);

    return false;
  },

  /**
   * @name orders/sendNotification
   * @method
   * @memberof Methods/Orders
   * @summary send order notification email
   * @param {Object} order - order object
   * @param {Object} action - send notification action
   * @return {Boolean} email sent or not
   */
  "orders/sendNotification": function (order, action) {
    check(order, Object);
    check(action, Match.OneOf(String, undefined));

    // TODO: REVIEW: SECURITY this only checks to see if a userId exists
    if (!this.userId) {
      Logger.error("orders/sendNotification: Access denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    // Get Shop information
    const shop = Shops.findOne(order.shopId);
    // TODO need to make this fully support multi-shop. Now it's just collapsing into one
    // Get shop logo, if available
    let emailLogo;
    if (Array.isArray(shop.brandAssets)) {
      const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
      const mediaId = Media.findOne(brandAsset.mediaId);
      emailLogo = path.join(Meteor.absoluteUrl(), mediaId.url());
    } else {
      emailLogo = Meteor.absoluteUrl() + "resources/email-templates/shop-logo.png";
    }

    let subtotal = 0;
    let shippingCost = 0;
    let taxes = 0;
    let discounts = 0;
    let amount = 0;
    let address = {};
    let paymentMethod = {};
    let shippingAddress = {};
    let tracking;
    let carrier = "";

    for (const billingRecord of order.billing) {
      subtotal += Number.parseFloat(billingRecord.invoice.subtotal);
      taxes += Number.parseFloat(billingRecord.invoice.taxes);
      discounts += Number.parseFloat(billingRecord.invoice.discounts);
      amount += billingRecord.paymentMethod.amount;
      address = billingRecord.address;
      paymentMethod = billingRecord.paymentMethod;
    }

    for (const shippingRecord of order.shipping) {
      shippingAddress = shippingRecord.address;
      carrier = shippingRecord.shipmentMethod.carrier;
      tracking = shippingRecord.tracking;
      shippingCost += shippingRecord.shipmentMethod.rate;
    }


    const refundResult = Meteor.call("orders/refunds/list", order);
    const refundTotal = Array.isArray(refundResult) && refundResult.reduce((acc, refund) => acc + refund.amount, 0);

    // Get user currency formatting from shops collection, remove saved rate
    // using billing[0] here to get the currency and exchange rate used because
    // in multishop mode, the currency object is different across shops
    // and it's inconsistent, i.e. sometimes there's no exchangeRate field in the secondary
    // shop's currency array.
    // TODO: Remove billing[0] and properly aquire userCurrency and exchange rate
    const userCurrencyFormatting = _.omit(shop.currencies[order.billing[0].currency.userCurrency], ["enabled", "rate"]);

    // Get user currency exchange rate at time of transaction
    const userCurrencyExchangeRate = order.billing[0].currency.exchangeRate;

    // Combine same products into single "product" for display purposes
    const combinedItems = [];
    if (order) {
      // Loop through all items in the order. The items are split into indivital items
      for (const orderItem of order.items) {
        // Find an exising item in the combinedItems array
        const foundItem = combinedItems.find((combinedItem) => {
          // If and item variant exists, then we return true
          if (combinedItem.variants) {
            return combinedItem.variants._id === orderItem.variants._id;
          }

          return false;
        });

        // Increment the quantity count for the duplicate product variants
        if (foundItem) {
          foundItem.quantity++;
        } else {
          // Otherwise push the unique item into the combinedItems array

          // Add displayPrice to match user currency settings
          orderItem.variants.displayPrice = accounting.formatMoney(
            orderItem.variants.price * userCurrencyExchangeRate, userCurrencyFormatting
          );

          combinedItems.push(orderItem);

          // Placeholder image if there is no product image
          orderItem.placeholderImage = Meteor.absoluteUrl() + "resources/placeholder.gif";

          const variantImage = Media.findOne({
            "metadata.productId": orderItem.productId,
            "metadata.variantId": orderItem.variants._id
          });
          // variant image
          if (variantImage) {
            orderItem.variantImage = path.join(Meteor.absoluteUrl(), variantImage.url());
          }
          // find a default image
          const productImage = Media.findOne({ "metadata.productId": orderItem.productId });
          if (productImage) {
            orderItem.productImage = path.join(Meteor.absoluteUrl(), productImage.url());
          }
        }
      }

      // Merge data into single object to pass to email template
      const dataForEmail = {
        // Shop Data
        shop: shop,
        contactEmail: shop.emails[0].address,
        homepage: Meteor.absoluteUrl(),
        emailLogo: emailLogo,
        copyrightDate: moment().format("YYYY"),
        legalName: shop.addressBook[0].company,
        physicalAddress: {
          address: shop.addressBook[0].address1 + " " + shop.addressBook[0].address2,
          city: shop.addressBook[0].city,
          region: shop.addressBook[0].region,
          postal: shop.addressBook[0].postal
        },
        shopName: shop.name,
        socialLinks: {
          display: true,
          facebook: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/facebook-icon.png",
            link: "https://www.facebook.com"
          },
          googlePlus: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/google-plus-icon.png",
            link: "https://plus.google.com"
          },
          twitter: {
            display: true,
            icon: Meteor.absoluteUrl() + "resources/email-templates/twitter-icon.png",
            link: "https://www.twitter.com"
          }
        },
        // Order Data
        order: order,
        billing: {
          address: {
            address: address.address1,
            city: address.city,
            region: address.region,
            postal: address.postal
          },
          paymentMethod: paymentMethod.storedCard || paymentMethod.processor,
          subtotal: accounting.formatMoney(
            subtotal * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          shipping: accounting.formatMoney(
            shippingCost * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          taxes: accounting.formatMoney(
            taxes * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          discounts: accounting.formatMoney(
            discounts * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          refunds: accounting.formatMoney(
            refundTotal * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          total: accounting.formatMoney(
            (subtotal + shippingCost) * userCurrencyExchangeRate, userCurrencyFormatting
          ),
          adjustedTotal: accounting.formatMoney(
            (amount - refundTotal) * userCurrencyExchangeRate, userCurrencyFormatting
          )
        },
        combinedItems: combinedItems,
        orderDate: moment(order.createdAt).format("MM/DD/YYYY"),
        orderUrl: `cart/completed?_id=${order.cartId}`,
        shipping: {
          tracking: tracking,
          carrier: carrier,
          address: {
            address: shippingAddress.address1,
            city: shippingAddress.city,
            region: shippingAddress.region,
            postal: shippingAddress.postal
          }
        }
      };

      Logger.debug(`orders/sendNotification status: ${order.workflow.status}`);


      // handle missing root shop email
      if (!shop.emails[0].address) {
        shop.emails[0].address = "no-reply@reactioncommerce.com";
        Logger.warn("No shop email configured. Using no-reply to send mail");
      }

      // anonymous users without emails.
      if (!order.email) {
        const msg = "No order email found. No notification sent.";
        Logger.warn(msg);
        throw new Meteor.Error("email-error", msg);
      }

      // Compile Email with SSR
      let subject;
      let tpl;

      if (action === "shipped") {
        tpl = "orders/shipped";
        subject = "orders/shipped/subject";
      } else if (action === "refunded") {
        tpl = "orders/refunded";
        subject = "orders/refunded/subject";
      } else if (action === "itemRefund") {
        tpl = "orders/itemRefund";
        subject = "orders/itemRefund/subject";
      } else {
        tpl = `orders/${order.workflow.status}`;
        subject = `orders/${order.workflow.status}/subject`;
      }

      SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
      SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

      Reaction.Email.send({
        to: order.email,
        from: `${shop.name} <${shop.emails[0].address}>`,
        subject: SSR.render(subject, dataForEmail),
        html: SSR.render(tpl, dataForEmail)
      });

      return true;
    }
    return false;
  },

  /**
   * @name orders/updateShipmentTracking
   * @summary Adds tracking information to order without workflow update.
   * Call after any tracking code is generated
   * @method
   * @memberof Methods/Orders
   * @param {Object} order - An Order object
   * @param {Object} shipment - A Shipment object
   * @param {String} tracking - tracking id
   * @return {String} returns order update result
   */
  "orders/updateShipmentTracking": function (order, shipment, tracking) {
    check(order, Object);
    check(shipment, Object);
    check(tracking, String);

    // REVIEW: This method should be callable from a webhook (e.g. Shippo)
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
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
   * @name orders/addOrderEmail
   * @method
   * @memberof Methods/Orders
   * @summary Adds email to order, used for guest users
   * @param {String} cartId - add tracking to orderId
   * @param {String} email - valid email address
   * @return {String} returns order update result
   */
  "orders/addOrderEmail": function (cartId, email) {
    check(cartId, String);
    check(email, String);
    /**
    *Instead of checking the Orders permission, we should check if user is
    *connected.This is only needed for guest where email is
    *provided for tracking order progress.
    */

    if (!Meteor.userId()) {
      throw new Meteor.Error("access-denied", "Access Denied. You are not connected.");
    }

    return Orders.update({
      cartId: cartId
    }, {
      $set: {
        email: email
      }
    });
  },

  /**
   * @name orders/updateHistory
   * @method
   * @memberof Methods/Orders
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

    // REVIEW: For marketplace implementations
    // This should be possible for anyone with permission to act on the order
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
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
   * @name orders/capturePayments
   * @summary Finalize any payment where mode is "authorize"
   * and status is "approved", reprocess as "capture"
   * @method
   * @memberof Methods/Orders
   * @param {String} orderId - add tracking to orderId
   * @return {null} no return value
   */
  "orders/capturePayments": (orderId) => {
    check(orderId, String);
    // REVIEW: For marketplace implmentations who should be able to capture payments?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const shopId = Reaction.getShopId(); // the shopId of the current user, i.e. merchant
    const order = Orders.findOne(orderId);
    // find the appropriate shipping record by shop
    const shippingRecord = order.shipping.find((sRecord) => sRecord.shopId === shopId);
    const itemIds = shippingRecord.items.map((item) => {
      return item._id;
    });

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

    if (order.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
    }

    // process order..payment.paymentMethod
    // find the billing record based on shopId
    const bilingRecord = order.billing.find((bRecord) => bRecord.shopId === shopId);

    const paymentMethod = bilingRecord.paymentMethod;
    const transactionId = paymentMethod.transactionId;

    if (paymentMethod.mode === "capture" && paymentMethod.status === "approved" && paymentMethod.processor) {
      // Grab the amount from the shipment, otherwise use the original amount
      const processor = paymentMethod.processor.toLowerCase();

      Meteor.call(`${processor}/payment/capture`, paymentMethod, (error, result) => {
        if (result && result.saved === true) {
          const metadata = Object.assign(bilingRecord.paymentMethod.metadata || {}, result.metadata || {});

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

          // event onOrderPaymentCaptured used for confirmation hooks
          // ie: confirmShippingMethodForOrder is triggered here
          Hooks.Events.run("onOrderPaymentCaptured", orderId);
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

          return { error: "orders/capturePayments: Failed to capture transaction" };
        }
        return { error, result };
      });
    }
  },

  /**
   * @name orders/refund/list
   * @summary loop through order's payments and find existing refunds.
   * Get a list of refunds for a particular payment method.
   * @method
   * @memberof Methods/Orders
   * @param {Object} order - order object
   * @return {Array} Array contains refund records
   */
  "orders/refunds/list": function (order) {
    check(order, Object);

    if (!this.userId === order.userId && !Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const refunds = [];
    for (const billingRecord of order.billing) {
      const paymentMethod = billingRecord.paymentMethod;
      const processor = paymentMethod.processor.toLowerCase();
      const shopRefunds = Meteor.call(`${processor}/refund/list`, paymentMethod);
      refunds.push(...shopRefunds);
    }
    return refunds;
  },

  /**
   * @name orders/refund/create
   * @method
   * @memberof Methods/Orders
   * @summary Apply a refund to an already captured order
   * @param {String} orderId - order object
   * @param {Object} paymentMethod - paymentMethod object
   * @param {Number} amount - Amount of the refund, as a positive number
   * @param {Bool} sendEmail - Send email confirmation
   * @return {null} no return value
   */
  "orders/refunds/create": function (orderId, paymentMethod, amount, sendEmail = true) {
    check(orderId, String);
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    check(sendEmail, Match.Optional(Boolean));

    // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const processor = paymentMethod.processor.toLowerCase();
    const order = Orders.findOne(orderId);
    const transactionId = paymentMethod.transactionId;

    const packageId = paymentMethod.paymentPackageId;
    const settingsKey = paymentMethod.paymentSettingsKey;
    // check if payment provider supports de-authorize
    const checkSupportedMethods = Packages.findOne({
      _id: packageId,
      shopId: Reaction.getShopId()
    }).settings[settingsKey].support;

    const orderMode = paymentMethod.mode;

    let result;
    let query = {};
    if (checkSupportedMethods.includes("De-authorize")) {
      result = Meteor.call(`${processor}/payment/deAuthorize`, paymentMethod, amount);
      query = {
        $push: {
          "billing.$.paymentMethod.transactions": result
        }
      };

      if (result.saved === false) {
        Logger.fatal("Attempt for de-authorize transaction failed", order._id, paymentMethod.transactionId, result.error);
        throw new Meteor.Error("Attempt to de-authorize transaction failed", result.error);
      }
    } else if (orderMode === "capture") {
      result = Meteor.call(`${processor}/refund/create`, paymentMethod, amount);
      query = {
        $push: {
          "billing.$.paymentMethod.transactions": result
        }
      };

      if (result.saved === false) {
        Logger.fatal("Attempt for refund transaction failed", order._id, paymentMethod.transactionId, result.error);
        throw new Meteor.Error("Attempt to refund transaction failed", result.error);
      }
    }

    Orders.update({
      "_id": orderId,
      "billing.shopId": Reaction.getShopId(),
      "billing.paymentMethod.transactionId": transactionId
    }, {
      $set: {
        "billing.$.paymentMethod.status": "refunded"
      },
      ...query
    });

    Hooks.Events.run("onOrderRefundCreated", orderId);

    // Send email to notify customer of a refund
    if (checkSupportedMethods.includes("De-authorize")) {
      Meteor.call("orders/sendNotification", order);
    } else if (orderMode === "capture" && sendEmail) {
      Meteor.call("orders/sendNotification", order, "refunded");
    }
  },

  /**
   * @name orders/refunds/refundItems
   * @method
   * @memberof Methods/Orders
   * @summary Apply a refund to line items
   * @param {String} orderId - order object
   * @param {Object} paymentMethod - paymentMethod object
   * @param {Object} refundItemsInfo - info about refund items
   * @return {Object} refund boolean and result/error value
   */
  "orders/refunds/refundItems": function (orderId, paymentMethod, refundItemsInfo) {
    check(orderId, String);
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(refundItemsInfo, Object);

    // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const fut = new Future();
    const order = Orders.findOne(orderId);
    const transactionId = paymentMethod.transactionId;
    const amount = refundItemsInfo.total;
    const quantity = refundItemsInfo.quantity;
    const refundItems = refundItemsInfo.items;
    const originalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

    // refund payment to customer
    Meteor.call("orders/refunds/create", order._id, paymentMethod, Number(amount), false, (error, result) => {
      if (error) {
        Logger.fatal("Attempt for refund transaction failed", order._id, paymentMethod.transactionId, error);
        fut.return({
          refund: false,
          error: error
        });
      }
      if (result) {
        refundItems.forEach(refundItem => {
          orderQuantityAdjust(orderId, refundItem);
        });

        let refundedStatus = "refunded";

        if (quantity < originalQuantity) {
          refundedStatus = "partialRefund";
        }

        Orders.update({
          "_id": orderId,
          "billing.shopId": Reaction.getShopId(),
          "billing.paymentMethod.transactionId": transactionId
        }, {
          $set: {
            "billing.$.paymentMethod.status": refundedStatus
          }
        });

        Meteor.call("orders/sendNotification", order, "itemRefund");

        fut.return({
          refund: true,
          result: result
        });
      }
    });
    return fut.wait();
  }
};

Meteor.methods(methods);

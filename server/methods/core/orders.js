import _ from "lodash";
import accounting from "accounting-js";
import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Orders, Products, Shops, Packages } from "/lib/collections";
import { PaymentMethodArgument } from "/lib/collections/schemas";
import { Logger, Hooks, Reaction } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";
import { publishProductInventoryAdjustments } from "/imports/plugins/core/catalog/server/methods/catalog";

/**
 * @name getPrimaryMediaForItem
 * @summary Gets the FileRecord for the primary media item associated with the variant or product
 *   for the given item. This is similar to a function in /lib/api/helpers, but that one uses
 *   Media.findOneLocal, which is only for browser code.
 * @param {Object} item Must have `productId` and/or `variantId` set to get back a result.
 * @return {FileRecord|null}
 */
async function getPrimaryMediaForItem({ productId, variantId } = {}) {
  let result;

  if (variantId) {
    result = await Media.findOne({
      "metadata.variantId": variantId
    }, { sort: { "metadata.priority": 1, "uploadedAt": 1 } });
  }

  if (!result && productId) {
    result = await Media.findOne({
      "metadata.productId": productId
    }, { sort: { "metadata.priority": 1, "uploadedAt": 1 } });
  }

  return result || null;
}

/**
 * @name formatDateForEmail
 * @method
 * @private
 * @summary helper to generate the order date as a string for emails
 * @param {Date} date
 * @return {String} return date formatted as a MM/DD/YYYY string
 */
function formatDateForEmail(date) {
  const emailDate = new Date(date); // Clone date
  const year = emailDate.getFullYear(); // get year
  const month = emailDate.getMonth() + 1; // get month number + 1 (js has 0 indexed months)
  const day = emailDate.getDate(); // get day number (js has 1 indexed days)

  const paddedMonth = month > 9 ? `${month}` : `0${month}`; // generate padded month if necessary
  const paddedDay = day > 9 ? `${day}` : `0${day}`; // generate padded days if necessary

  return `${paddedMonth}/${paddedDay}/${year}`; // return MM/DD/YYYY formatted string
}


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
  const creditBillingRecords = order.billing.filter((value) => value.paymentMethod.method === "credit");
  const billingRecord = creditBillingRecords.find((billing) => billing.shopId === Reaction.getShopId());
  return billingRecord;
}

/**
 * @name orderDebitMethod
 * @method
 * @memberof Methods/Orders
 * @summary Helper to return the order debit object
 * @param  {Object} order order object
 * @return {Object} returns entire payment method
 */
export function orderDebitMethod(order) {
  const debitBillingRecords = order.billing.filter((value) => value.paymentMethod.method === "debit");
  const billingRecord = debitBillingRecords.find((billing) => billing.shopId === Reaction.getShopId());
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
  order.items.forEach((item) => {
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

    Hooks.Events.run("afterUpdateCatalogProduct", item.variant);

    // Publish inventory updates to the Catalog
    publishProductInventoryAdjustments(item.productId);
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
  order.items.forEach((item) => {
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

      Hooks.Events.run("afterUpdateCatalogProduct", item.variants);

      // Publish inventory updates to the Catalog
      publishProductInventoryAdjustments(item.productId);
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
      }, {
        $set: { "items.$.quantity": newQuantity }
      });
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
  "orders/shipmentPicked"(order, shipment) {
    check(order, Object);
    check(shipment, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as picked
    const itemIds = shipment.items.map((item) => item._id);

    const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/picked", order, itemIds);
    if (result === 1) {
      return Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/picked"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/picked"
        }
      }, { bypassCollection2: true });
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
  "orders/shipmentPacked"(order, shipment) {
    check(order, Object);
    check(shipment, Object);

    // REVIEW: who should have permission to do this in a marketplace setting?
    // Do we need to update the order schema to reflect multiple packers / shipments?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as packed
    const itemIds = shipment.items.map((item) => item._id);

    const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/packed", order, itemIds);
    if (result === 1) {
      return Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/packed"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/packed"
        }
      }, { bypassCollection2: true });
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
  "orders/shipmentLabeled"(order, shipment) {
    check(order, Object);
    check(shipment, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Set the status of the items as labeled
    const itemIds = shipment.items.map((item) => item._id);

    const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/labeled", order, itemIds);
    if (result === 1) {
      return Orders.update({
        "_id": order._id,
        "shipping._id": shipment._id
      }, {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/labeled"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/labeled"
        }
      }, { bypassCollection2: true });
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
  "orders/makeAdjustmentsToInvoice"(order) {
    check(order, Object);

    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock(); // REVIEW: Why unblock here?

    return Orders.update({
      "_id": order._id,
      "billing.shopId": Reaction.getShopId(),
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
  "orders/approvePayment"(order) {
    check(order, Object);
    const { invoice } = orderCreditMethod(order);

    // REVIEW: Who should have access to do this for a marketplace?
    // Do we have/need a shopId on each order?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock(); // REVIEW: why unblock here?

    // this is server side check to verify
    // that the math all still adds up.
    const shopId = Reaction.getShopId();
    const { discounts, shipping, subtotal, taxes } = invoice;
    const discountTotal = Math.max(0, subtotal - discounts); // ensure no discounting below 0.
    const total = accounting.toFixed(Number(discountTotal) + Number(shipping) + Number(taxes), 2);

    // Updates flattened inventory count on variants in Products collection
    ordersInventoryAdjustByShop(order._id, shopId);

    const result = Orders.update({
      "_id": order._id,
      "billing.shopId": shopId,
      "billing.paymentMethod.method": "credit"
    }, {
      $set: {
        "billing.$.paymentMethod.amount": total,
        "billing.$.paymentMethod.status": "approved",
        "billing.$.paymentMethod.mode": "capture",
        "billing.$.invoice.discounts": discounts,
        "billing.$.invoice.total": Number(total)
      }
    });

    // Update search record
    Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);

    return result;
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
  "orders/cancelOrder"(order, returnToStock) {
    check(order, Object);
    check(returnToStock, Boolean);

    // REVIEW: Only marketplace admins should be able to cancel entire order?
    // Unless order is entirely contained in a single shop? Do we need a switch on marketplace owner dashboard?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Inventory is removed from stock only once an order has been approved
    // This is indicated by order.billing.$.paymentMethod.status being anything other than `created`
    // We need to check to make sure the inventory has been removed before we return it to stock
    const orderIsApproved = order.billing.find((status) => status.paymentMethod.status !== "created");

    if (returnToStock && orderIsApproved) {
      // Run this Product update inline instead of using ordersInventoryAdjust because the collection hooks fail
      // in some instances which causes the order not to cancel
      order.items.forEach((item) => {
        if (Reaction.hasPermission("orders", Meteor.userId(), item.shopId)) {
          Products.update({
            _id: item.variants._id,
            shopId: item.shopId
          }, {
            $inc: {
              inventoryQuantity: +item.quantity
            }
          }, {
            bypassCollection2: true,
            publish: true
          });

          Hooks.Events.run("afterUpdateCatalogProduct", item.variants);

          // Publish inventory updates to the Catalog
          publishProductInventoryAdjustments(item.productId);
        }
      });
    }

    const billingRecord = order.billing.find((billing) => billing.shopId === Reaction.getShopId());
    const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());

    let { paymentMethod } = orderCreditMethod(order);
    paymentMethod = Object.assign(paymentMethod, { amount: Number(paymentMethod.amount) });
    const invoiceTotal = billingRecord.invoice.total;
    const shipment = shippingRecord;
    const itemIds = shipment.items.map((item) => item._id);

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
      "billing.shopId": Reaction.getShopId(),
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
  "orders/processPayment"(order) {
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

        const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());
        // Set the status of the items as shipped
        const itemIds = shippingRecord.items.map((item) => item._id);

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
  "orders/shipmentShipped"(order, shipment) {
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

    const itemIds = shipment.items.map((item) => item._id);

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
      },
      $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/shipped"
      }
    }, { bypassCollection2: true });

    return {
      workflowResult,
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
  "orders/shipmentDelivered"(order) {
    check(order, Object);

    // REVIEW: this should be callable from the server via callback from Shippo or other webhook
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    const shipment = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());

    if (order.email) {
      Meteor.call("orders/sendNotification", order, (err) => {
        if (err) {
          Logger.error(err, "orders/shipmentDelivered: Failed to send notification");
        }
      });
    } else {
      Logger.warn("No order email found. No notification sent.");
    }

    const itemIds = shipment.items.map((item) => item._id);

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/delivered", order, itemIds);
    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

    const isCompleted = order.items.every((item) => item.workflow.workflow && item.workflow.workflow.includes("coreOrderItemWorkflow/completed"));

    Orders.update({
      "_id": order._id,
      "shipping._id": shipment._id
    }, {
      $set: {
        "shipping.$.workflow.status": "coreOrderWorkflow/delivered"
      },
      $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/delivered"
      }
    }, { bypassCollection2: true });

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
  "orders/sendNotification"(order, action) {
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
    const emailLogo = Reaction.Email.getShopLogo(shop);

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
      ({ address } = billingRecord);
      ({ paymentMethod } = billingRecord);
    }

    for (const shippingRecord of order.shipping) {
      shippingAddress = shippingRecord.address;
      ({ tracking } = shippingRecord);
      const { shipmentMethod } = shippingRecord;
      ({ carrier } = shipmentMethod || {});
      const { rate } = shipmentMethod || {};
      shippingCost += rate || 0;
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
          foundItem.quantity += 1;
        } else {
          // Otherwise push the unique item into the combinedItems array

          // Add displayPrice to match user currency settings
          orderItem.variants.displayPrice = accounting.formatMoney(orderItem.variants.price * userCurrencyExchangeRate, userCurrencyFormatting);

          combinedItems.push(orderItem);

          // Placeholder image if there is no product image
          orderItem.placeholderImage = `${Meteor.absoluteUrl()}resources/placeholder.gif`;

          // variant image
          const variantImage = Promise.await(getPrimaryMediaForItem({
            productId: orderItem.productId,
            variantId: orderItem.variants && orderItem.variants._id
          }));
          if (variantImage) {
            orderItem.variantImage = variantImage.url({ absolute: true, store: "large" });
          }

          // find a default image
          const productImage = Promise.await(getPrimaryMediaForItem({ productId: orderItem.productId }));
          if (productImage) {
            orderItem.productImage = productImage.url({ absolute: true, store: "large" });
          }
        }
      }

      const copyrightDate = new Date().getFullYear();

      // Merge data into single object to pass to email template
      const dataForEmail = {
        // Shop Data
        shop,
        contactEmail: shop.emails[0].address,
        homepage: Meteor.absoluteUrl(),
        emailLogo,
        copyrightDate,
        legalName: _.get(shop, "addressBook[0].company"),
        physicalAddress: {
          address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
          city: _.get(shop, "addressBook[0].city"),
          region: _.get(shop, "addressBook[0].region"),
          postal: _.get(shop, "addressBook[0].postal")
        },
        shopName: shop.name,
        socialLinks: {
          display: true,
          facebook: {
            display: true,
            icon: `${Meteor.absoluteUrl()}resources/email-templates/facebook-icon.png`,
            link: "https://www.facebook.com"
          },
          googlePlus: {
            display: true,
            icon: `${Meteor.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
            link: "https://plus.google.com"
          },
          twitter: {
            display: true,
            icon: `${Meteor.absoluteUrl()}resources/email-templates/twitter-icon.png`,
            link: "https://www.twitter.com"
          }
        },
        // Order Data
        order,
        billing: {
          address: {
            address: `${address.address1}${address.address2 ? ` ${address.address2}` : ""}`,
            city: address.city,
            region: address.region,
            postal: address.postal
          },
          paymentMethod: paymentMethod.storedCard || paymentMethod.processor,
          subtotal: accounting.formatMoney(subtotal * userCurrencyExchangeRate, userCurrencyFormatting),
          shipping: accounting.formatMoney(shippingCost * userCurrencyExchangeRate, userCurrencyFormatting),
          taxes: accounting.formatMoney(taxes * userCurrencyExchangeRate, userCurrencyFormatting),
          discounts: accounting.formatMoney(discounts * userCurrencyExchangeRate, userCurrencyFormatting),
          refunds: accounting.formatMoney(refundTotal * userCurrencyExchangeRate, userCurrencyFormatting),
          total: accounting.formatMoney((subtotal + shippingCost + taxes - discounts) * userCurrencyExchangeRate, userCurrencyFormatting),
          adjustedTotal: accounting.formatMoney((amount - refundTotal) * userCurrencyExchangeRate, userCurrencyFormatting)
        },
        combinedItems,
        orderDate: formatDateForEmail(order.createdAt),
        orderUrl: `cart/completed?_id=${order.cartId}`,
        shipping: {
          tracking,
          carrier,
          address: {
            address: `${shippingAddress.address1}${shippingAddress.address2 ? ` ${shippingAddress.address2}` : ""}`,
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
  "orders/updateShipmentTracking"(order, shipment, tracking) {
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
        "shipping.$.tracking": tracking
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
  "orders/addOrderEmail"(cartId, email) {
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

    return Orders.update({ cartId }, { $set: { email } });
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
  "orders/updateHistory"(orderId, event, value) {
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
          event,
          value,
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
    const itemIds = shippingRecord.items.map((item) => item._id);

    Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

    if (order.workflow.status === "new") {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
    }

    // process order..payment.paymentMethod
    // find the billing record based on shopId
    const bilingRecord = order.billing.find((bRecord) => bRecord.shopId === shopId);

    const { paymentMethod } = bilingRecord;
    const { transactionId } = paymentMethod;

    if (paymentMethod.mode === "capture" && paymentMethod.status === "approved" && paymentMethod.processor) {
      // Grab the amount from the shipment, otherwise use the original amount
      const processor = paymentMethod.processor.toLowerCase();

      let result;
      let error;
      try {
        result = Meteor.call(`${processor}/payment/capture`, paymentMethod);
      } catch (e) {
        error = e;
      }

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
        return { error, result };
      }

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
  "orders/refunds/list"(order) {
    check(order, Object);

    if (!this.userId === order.userId && !Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const refunds = [];
    for (const billingRecord of order.billing) {
      const { paymentMethod } = billingRecord;
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
  "orders/refunds/create"(orderId, paymentMethod, amount, sendEmail = true) {
    check(orderId, String);
    check(amount, Number);
    check(sendEmail, Match.Optional(Boolean));

    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

    // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const processor = paymentMethod.processor.toLowerCase();
    const order = Orders.findOne(orderId);
    const { transactionId } = paymentMethod;

    const packageId = paymentMethod.paymentPackageId;
    const settingsKey = paymentMethod.paymentSettingsKey;
    // check if payment provider supports de-authorize
    const checkSupportedMethods = Packages.findOne({
      _id: packageId
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
  "orders/refunds/refundItems"(orderId, paymentMethod, refundItemsInfo) {
    check(orderId, String);
    check(refundItemsInfo, Object);

    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

    // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
    if (!Reaction.hasPermission("orders")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const fut = new Future();
    const order = Orders.findOne(orderId);
    const { transactionId } = paymentMethod;
    const amount = refundItemsInfo.total;
    const { quantity } = refundItemsInfo;
    const refundItems = refundItemsInfo.items;
    const originalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

    // refund payment to customer
    Meteor.call("orders/refunds/create", order._id, paymentMethod, Number(amount), false, (error, result) => {
      if (error) {
        Logger.fatal("Attempt for refund transaction failed", order._id, paymentMethod.transactionId, error);
        fut.return({
          refund: false,
          error
        });
      }
      if (result) {
        refundItems.forEach((refundItem) => {
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
          result
        });
      }
    });
    return fut.wait();
  }
};

Meteor.methods(methods);

import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import * as Collections from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";


/**
 * @name cart/copyCartToOrder
 * @method
 * @memberof Methods/Cart
 * @summary Transform Cart to Order when a payment is processed.
 * We want to copy the cart over to an order object, and give the user a new empty
 * cart. Reusing the cart schema makes sense, but integrity of the order,
 * we don't want to just make another cart item
 * @todo  Partial order processing, shopId processing
 * @todo  Review Security on this method
 * @param {String} cartId - cartId to transform to order
 * @return {String} returns orderId
 */
export function copyCartToOrder(cartId) {
  check(cartId, String);
  const cart = Collections.Cart.findOne(cartId);

  // security check - method can only be called on own cart
  if (cart.userId !== Meteor.userId()) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Init new order object from existing cart
  const order = Object.assign({}, cart);

  // get sessionId from cart while cart is fresh
  const { sessionId } = cart;

  // If there are no order items, throw an error. We won't create an empty order
  if (!order.items || order.items.length === 0) {
    const msg = "An error occurred saving the order. Missing cart items.";
    Logger.error(msg);
    throw new Meteor.Error("error-occurred", msg);
  }

  // Debug only message to identify the current cartId
  Logger.debug("cart/copyCartToOrder", cartId);

  // Set our new order's cartId to existing cart._id
  // We'll get a new _id for our order
  order.cartId = cart._id;

  // This block assigns an existing user's email associated with their account to this order
  // We copied order from cart, so this userId and email are coming from the existing cart
  if (order.userId && !order.email) {
    // If we have a userId, but do _not_ have an email associated with this order
    // we need to go find the account associated with this userId
    const account = Collections.Accounts.findOne(order.userId);

    // Check to make sure that the account exists and has an emails field
    if (typeof account === "object" && account.emails) {
      for (const email of account.emails) {
        // If a user has specified an alternate "order" email address, use that
        if (email.provides === "orders") {
          order.email = email.address;
          // Otherwise, check to see if the user has a "default" email address
        } else if (email.provides === "default") {
          order.email = email.address;
        }
        // If we can't find any relevant email addresses for the user, we'll
        // let them assign an email address to this order after the checkout
      }
    }
  }

  // The schema will provide default values for these fields in our new order
  // so we'll delete the values copied from the cart
  delete order.createdAt; // autovalues from cart
  delete order.updatedAt;
  delete order.getCount;
  delete order.getShippingTotal;
  delete order.getSubTotal;
  delete order.getTaxTotal;
  delete order.getDiscounts;
  delete order.getTotal;
  delete order._id;


  // Create a shipping record for each shop on the order
  if (Array.isArray(order.shipping)) {
    if (order.shipping.length > 0) {
      const shippingRecords = [];
      order.shipping.map((shippingRecord) => {
        const billingRecord = order.billing.find((billing) => billing.shopId === shippingRecord.shopId);
        shippingRecord.paymentId = billingRecord._id;
        shippingRecord.items = [];
        shippingRecord.items.packed = false;
        shippingRecord.items.shipped = false;
        shippingRecord.items.delivered = false;
        shippingRecord.workflow = { status: "new", workflow: ["coreOrderWorkflow/notStarted"] };
        shippingRecords.push(shippingRecord);
        return shippingRecords;
      });
      order.shipping = shippingRecords;
    }
  } else { // if not - create it
    order.shipping = [];
  }

  // Add current exchange rate into order.billing.currency
  // If user currency === shop currency, exchange rate = 1.0
  const currentUser = Meteor.user();
  let userCurrency = Reaction.getShopCurrency();
  let exchangeRate = "1.00";

  if (currentUser && currentUser.profile && currentUser.profile.currency) {
    userCurrency = Meteor.user().profile.currency;
  }

  if (userCurrency !== Reaction.getShopCurrency()) {
    const userExchangeRate = Meteor.call("shop/getCurrencyRates", userCurrency);

    if (typeof userExchangeRate === "number") {
      exchangeRate = userExchangeRate;
    } else {
      Logger.warn("Failed to get currency exchange rates. Setting exchange rate to null.");
      exchangeRate = null;
    }
  }

  if (!order.billing[0].currency) {
    order.billing[0].currency = {
      // userCurrency is shopCurrency unless user has selected a different currency than the shop
      userCurrency
    };
  }

  order.items = order.items.map((item) => {
    item.shippingMethod = order.shipping[order.shipping.length - 1];
    item.workflow = {
      status: "new",
      workflow: ["coreOrderWorkflow/created"]
    };

    return item;
  });

  // Assign items to each shipping record based on the shopId of the item
  _.each(order.items, (item) => {
    const shippingRecord = order.shipping.find((sRecord) => sRecord.shopId === item.shopId);
    const shipmentItem = {
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
      shopId: item.shopId,
      variantId: item.variants._id
    };
    // If the shipment exists
    if (shippingRecord.items) {
      shippingRecord.items.push(shipmentItem);
    } else {
      shippingRecord.items = [shipmentItem];
    }
  });

  order.billing[0].currency.exchangeRate = exchangeRate;
  order.workflow.status = "new";
  order.workflow.workflow = ["coreOrderWorkflow/created"];

  // insert new reaction order
  const orderId = Collections.Orders.insert(order);
  Hooks.Events.run("afterOrderInsert", order);

  if (orderId) {
    Collections.Cart.remove({
      _id: order.cartId
    });
    // create a new cart for the user
    // even though this should be caught by
    // subscription handler, it's not always working
    const newCartExists = Collections.Cart.find({ userId: order.userId });
    if (newCartExists.count() === 0) {
      Meteor.call("cart/createCart", this.userId, sessionId);

      // reset the checkout workflow to the beginning for an anonymous user.
      // Using `Roles.userIsInRole` here because currently `Reaction.hasPermission("anonymous")`
      // will not return the correct result for actual anonymous users
      if (Roles.userIsInRole(currentUser, "anonymous", Reaction.getShopId())) {
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
      } else {
        // after recreate new cart we need to make it looks like previous by
        // updating `cart/workflow/status` to "coreCheckoutShipping"
        // by calling `workflow/pushCartWorkflow` three times. This is the only
        // way to do that without refactoring of `workflow/pushCartWorkflow`
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook");
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
      }
    }

    Logger.info(`Transitioned cart ${cartId} to order ${orderId}`);
    // catch send notification, we don't want
    // to block because of notification errors

    if (order.email) {
      Meteor.call("orders/sendNotification", Collections.Orders.findOne(orderId), (err) => {
        if (err) {
          Logger.error(err, `Error in orders/sendNotification for order ${orderId}`);
        }
      });
    }

    // order success
    return orderId;
  }
  // we should not have made it here, throw error
  throw new Meteor.Error("bad-request", "cart/copyCartToOrder: Invalid request");
}

Meteor.methods({
  "cart/copyCartToOrder": copyCartToOrder
});

import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger"
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Cart, Orders } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCart from "/imports/plugins/core/cart/server/util/getCart";
import sendOrderEmail from "/imports/plugins/core/orders/server/util/sendOrderEmail";
import findProductAndVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/findProductAndVariant";

/**
 * @name cart/copyCartToOrder
 * @method
 * @memberof Cart/Methods
 * @summary Transform Cart to Order when a payment is processed.
 * We want to copy the cart over to an order object, and give the user a new empty
 * cart. Reusing the cart schema makes sense, but integrity of the order,
 * we don't want to just make another cart item
 * @todo  Partial order processing, shopId processing
 * @todo  Review Security on this method
 * @param {String} cartId - cartId to transform to order
 * @param {String} [cartToken] - Token for cart, if it's anonymous
 * @return {String} returns orderId
 */
export default function copyCartToOrder(cartId, cartToken) {
  check(cartId, String);
  check(cartToken, Match.Maybe(String));

  const { cart } = getCart(cartId, { cartToken, throwIfNotFound: true });

  // Init new order object from existing cart
  const order = Object.assign({}, cart);

  // If there are no order items, throw an error. We won't create an empty order
  if (!order.items || order.items.length === 0) {
    const msg = "An error occurred saving the order. Missing cart items.";
    Logger.error(msg);
    throw new ReactionError("error-occurred", msg);
  }

  // Debug only message to identify the current cartId
  Logger.debug("cart/copyCartToOrder", cartId);

  // Set our new order's cartId to existing cart._id
  // We'll get a new _id for our order
  order.cartId = cart._id;

  // Get the current user and their account
  const currentUser = Meteor.user();
  let account = null;
  if (currentUser) {
    account = Accounts.findOne({ userId: currentUser._id }, { fields: { _id: 1, emails: 1 } });
  }

  // Anonymous carts do not have an accountId prop, but we'll set it to the anonymous account for the order
  if (!order.accountId && account) {
    order.accountId = account._id;
  }

  // This block assigns an existing user's email associated with their account to this order
  // We copied order from cart, so this accountId and email are coming from the existing cart
  if (order.accountId && !order.email) {
    // Check to make sure that the account exists and has an emails field
    if (account && account.emails) {
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

  // These will get new values or are not needed
  delete order.anonymousAccessToken;
  delete order.bypassAddressValidation;
  delete order.getCount;
  delete order.getShippingTotal;
  delete order.getSubTotal;
  delete order.getTaxTotal;
  delete order.getDiscounts;
  delete order.getTotal;
  delete order._id;

  const now = new Date();
  order.createdAt = now;
  order.updatedAt = now;

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
    const {
      catalogProduct,
      variant: chosenVariant
    } = Promise.await(findProductAndVariant(rawCollections, item.productId, item.variantId));

    item.product = catalogProduct;
    item.shippingMethod = order.shipping[order.shipping.length - 1];
    item.variants = chosenVariant;
    item.workflow = {
      status: "new",
      workflow: ["coreOrderWorkflow/created"]
    };

    // While we're looping, assign items to each shipping record based on the shopId of the item
    const shipmentItem = {
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
      shopId: item.shopId,
      variantId: item.variantId
    };
    // If the shipment exists
    const shippingRecord = order.shipping.find((sRecord) => sRecord.shopId === item.shopId);
    if (shippingRecord.items) {
      shippingRecord.items.push(shipmentItem);
    } else {
      shippingRecord.items = [shipmentItem];
    }

    return item;
  });

  order.billing[0].currency.exchangeRate = exchangeRate;
  order.workflow.status = "new";
  order.workflow.workflow = ["coreOrderWorkflow/created"];

  // insert new reaction order
  const orderId = Orders.insert(order);
  Hooks.Events.run("afterOrderInsert", order);

  Cart.remove({ _id: order.cartId });

  Logger.info(`Transitioned cart ${cartId} to order ${orderId}`);

  sendOrderEmail(order);

  return orderId;
}

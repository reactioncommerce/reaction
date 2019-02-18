import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import formatMoney from "/imports/utils/formatMoney";
import { Media } from "/imports/plugins/core/files/server";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";

/**
 * @name getPrimaryMediaForItem
 * @method
 * @summary Gets the FileRecord for the primary media item associated with the variant or product
 *   for the given item. This is similar to a function in /lib/api/helpers, but that one uses
 *   Media.findOneLocal, which is only for browser code.
 * @param {Object} item Must have `productId` and/or `variantId` set to get back a result.
 * @return {FileRecord|null} The primary media file record
 * @ignore
 */
async function getPrimaryMediaForItem({ productId, variantId } = {}) {
  let result;

  if (variantId) {
    result = await Media.findOne(
      {
        "metadata.variantId": variantId
      },
      { sort: { "metadata.priority": 1, "uploadedAt": 1 } }
    );
  }

  if (!result && productId) {
    result = await Media.findOne(
      {
        "metadata.productId": productId
      },
      { sort: { "metadata.priority": 1, "uploadedAt": 1 } }
    );
  }

  return result || null;
}

/**
 * @name formatDateForEmail
 * @method
 * @private
 * @summary helper to generate the order date as a string for emails
 * @param {Date} date The date to format
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
 * @summary Sends an email about an order.
 * @param {Object} order - The order document
 * @param {String} [action] - The action triggering the email
 * @returns {Boolean} True if sent; else false
 */
export default function sendOrderEmail(order, action) {
  // anonymous account orders without emails.
  if (!order.email) {
    Logger.info("No order email found. No notification sent.");
    return false;
  }

  // Get Shop information
  const shop = Shops.findOne({ _id: order.shopId });

  // TODO need to make this fully support multiple fulfillment groups. Now it's just collapsing into one
  const amount = order.shipping.reduce((sum, group) => sum + group.invoice.total, 0);
  const discounts = order.shipping.reduce((sum, group) => sum + group.invoice.discounts, 0);
  const subtotal = order.shipping.reduce((sum, group) => sum + group.invoice.subtotal, 0);
  const taxes = order.shipping.reduce((sum, group) => sum + group.invoice.taxes, 0);
  const shippingCost = order.shipping.reduce((sum, group) => sum + group.invoice.shipping, 0);

  const { address: shippingAddress, shipmentMethod, tracking } = order.shipping[0];
  const { carrier } = shipmentMethod;
  const [firstPayment] = (order.payments || []);
  const { address: paymentBillingAddress, currency } = firstPayment || {};

  const shippingAddressForEmail = shippingAddress ? {
    address: `${shippingAddress.address1}${shippingAddress.address2 ? ` ${shippingAddress.address2}` : ""}`,
    city: shippingAddress.city,
    region: shippingAddress.region,
    postal: shippingAddress.postal
  } : null;

  let billingAddressForEmail = null;
  if (order.billingAddress) {
    billingAddressForEmail = {
      address: `${order.billingAddress.address1}${order.billingAddress.address2 ? ` ${order.billingAddress.address2}` : ""}`,
      city: order.billingAddress.city,
      region: order.billingAddress.region,
      postal: order.billingAddress.postal
    };
  } else if (paymentBillingAddress) {
    billingAddressForEmail = {
      address: `${paymentBillingAddress.address1}${paymentBillingAddress.address2 ? ` ${paymentBillingAddress.address2}` : ""}`,
      city: paymentBillingAddress.city,
      region: paymentBillingAddress.region,
      postal: paymentBillingAddress.postal
    };
  }

  const refunds = [];

  if (Array.isArray(order.payments)) {
    const context = Promise.await(getGraphQLContextInMeteorMethod(null));
    for (const payment of order.payments) {
      const shopRefunds = Promise.await(getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment));
      const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({ ...shopRefund, paymentId: payment._id }));
      refunds.push(...shopRefundsWithPaymentId);
    }
  }

  const refundTotal = refunds.reduce((acc, refund) => acc + refund.amount, 0);

  const userCurrency = (currency && currency.userCurrency) || shop.currency;

  // Get user currency exchange rate at time of transaction
  const userCurrencyExchangeRate = (currency && currency.exchangeRate) || 1;

  // Combine same products into single "product" for display purposes
  const combinedItems = [];

  // Loop through all items in the order. The items are split into individual items
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
  for (const orderItem of orderItems) {
    // Find an existing item in the combinedItems array
    const foundItem = combinedItems.find((combinedItem) => combinedItem.variantId === orderItem.variantId);

    // Increment the quantity count for the duplicate product variants
    if (foundItem) {
      foundItem.quantity += 1;
    } else {
      // Otherwise push the unique item into the combinedItems array

      // Add displayAmount to match user currency settings
      orderItem.price.displayAmount = formatMoney(orderItem.price.amount * userCurrencyExchangeRate, userCurrency);

      combinedItems.push(orderItem);

      // Placeholder image if there is no product image
      orderItem.placeholderImage = `${Reaction.absoluteUrl()}resources/placeholder.gif`;

      // variant image
      const variantImage = Promise.await(getPrimaryMediaForItem({
        productId: orderItem.productId,
        variantId: orderItem.variantId
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
    homepage: Reaction.absoluteUrl(),
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
        icon: `${Reaction.absoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${Reaction.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${Reaction.absoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    // Order Data
    order,
    billing: {
      address: billingAddressForEmail,
      payments: (order.payments || []).map((payment) => ({
        displayName: payment.displayName,
        displayAmount: formatMoney(payment.amount * userCurrencyExchangeRate, userCurrency)
      })),
      subtotal: formatMoney(subtotal * userCurrencyExchangeRate, userCurrency),
      shipping: formatMoney(shippingCost * userCurrencyExchangeRate, userCurrency),
      taxes: formatMoney(taxes * userCurrencyExchangeRate, userCurrency),
      discounts: formatMoney(discounts * userCurrencyExchangeRate, userCurrency),
      refunds: formatMoney(refundTotal * userCurrencyExchangeRate, userCurrency),
      total: formatMoney(
        (subtotal + shippingCost + taxes - discounts) * userCurrencyExchangeRate,
        userCurrency
      ),
      adjustedTotal: formatMoney(
        (amount - refundTotal) * userCurrencyExchangeRate,
        userCurrency
      )
    },
    combinedItems,
    orderDate: formatDateForEmail(order.createdAt),
    orderUrl: `cart/completed?_id=${order.cartId}`,
    shipping: {
      tracking,
      carrier,
      address: shippingAddressForEmail
    }
  };

  Logger.debug(`sendOrderEmail status: ${order.workflow.status}`);

  // handle missing root shop email
  if (!shop.emails[0].address) {
    shop.emails[0].address = "no-reply@reactioncommerce.com";
    Logger.warn("No shop email configured. Using no-reply to send mail");
  }

  // Compile Email with SSR
  let templateName;

  if (action === "shipped") {
    templateName = "orders/shipped";
  } else if (action === "refunded") {
    templateName = "orders/refunded";
  } else if (action === "itemRefund") {
    templateName = "orders/itemRefund";
  } else {
    templateName = `orders/${order.workflow.status}`;
  }

  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
  Promise.await(context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName,
    to: order.email
  }));

  return true;
}

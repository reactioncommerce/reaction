import _ from "lodash";
import formatMoney from "@reactioncommerce/api-utils/formatMoney.js";
import xformOrderItems from "../xforms/xformOrderItems.js";
import { addAnonymousOrderToken } from "./anonymousToken.js";

/**
 * @name formatDateForEmail
 * @method
 * @private
 * @summary helper to generate the order date as a string for emails
 * @param {Date} date The date to format
 * @returns {String} return date formatted as a MM/DD/YYYY string
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
 * @summary Builds data for rendering order emails
 * @param {Object} context - App context
 * @param {Object} input - Necessary input
 * @param {Object} input.order - The order document
 * @returns {Object} Data object to use when rendering email templates
 */
export default async function getDataForOrderEmailDefault(context, { order }) {
  const { collections, getAbsoluteUrl } = context;
  const { Accounts, Shops } = collections;

  // Get Shop information
  const shop = await Shops.findOne({ _id: order.shopId });

  // Get Account information
  let account = null;
  if (order.accountId) {
    account = await Accounts.findOne({ _id: order.accountId });
  }

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
    fullName: shippingAddress.fullName,
    postal: shippingAddress.postal,
    region: shippingAddress.region
  } : null;

  let billingAddressForEmail = null;
  if (order.billingAddress) {
    billingAddressForEmail = {
      address: `${order.billingAddress.address1}${order.billingAddress.address2 ? ` ${order.billingAddress.address2}` : ""}`,
      city: order.billingAddress.city,
      fullName: order.billingAddress.fullName,
      postal: order.billingAddress.postal,
      region: order.billingAddress.region
    };
  } else if (paymentBillingAddress) {
    billingAddressForEmail = {
      address: `${paymentBillingAddress.address1}${paymentBillingAddress.address2 ? ` ${paymentBillingAddress.address2}` : ""}`,
      city: paymentBillingAddress.city,
      fullName: paymentBillingAddress.fullName,
      postal: paymentBillingAddress.postal,
      region: paymentBillingAddress.region
    };
  }

  const refunds = [];

  if (Array.isArray(order.payments)) {
    const promises = order.payments.map(async (payment) => {
      const shopRefunds = await context.queries.getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment);
      const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({ ...shopRefund, paymentId: payment._id }));
      refunds.push(...shopRefundsWithPaymentId);
    });
    await Promise.all(promises);
  }

  const refundTotal = refunds.reduce((acc, refund) => acc + refund.amount, 0);

  const userCurrency = (currency && currency.userCurrency) || shop.currency;

  // Get user currency exchange rate at time of transaction
  const userCurrencyExchangeRate = (currency && currency.exchangeRate) || 1;

  // Combine same products into single "product" for display purposes
  const combinedItems = [];

  // Transform all order items to add images, etc.
  const adjustedOrderGroups = await Promise.all(order.shipping.map(async (group) => {
    let items = await xformOrderItems(context, group.items);

    items = items.map((item) => ({
      ...item,
      placeholderImage: getAbsoluteUrl("/resources/placeholder.gif"),
      price: {
        ...item.price,
        // Add displayAmount to match user currency settings
        displayAmount: formatMoney(item.price.amount * userCurrencyExchangeRate, userCurrency)
      },
      subtotal: {
        ...item.subtotal,
        // Add displayAmount to match user currency settings
        displayAmount: formatMoney(item.subtotal.amount * userCurrencyExchangeRate, userCurrency)
      },
      // These next two are for backward compatibility with existing email templates.
      // New templates should use `imageURLs` instead.
      productImage: item.imageURLs && item.imageURLs.large,
      variantImage: item.imageURLs && item.imageURLs.large
    }));

    return { ...group, items };
  }));

  // Loop through all items in the order. The items are split into individual items
  const orderItems = adjustedOrderGroups.reduce((list, group) => [...list, ...group.items], []);
  for (const orderItem of orderItems) {
    // Find an existing item in the combinedItems array
    const foundItem = combinedItems.find((combinedItem) => combinedItem.variantId === orderItem.variantId);

    // Increment the quantity count for the duplicate product variants
    if (foundItem) {
      foundItem.quantity += orderItem.quantity;
    } else {
      // Otherwise push the unique item into the combinedItems array
      combinedItems.push(orderItem);
    }
  }

  const copyrightDate = new Date().getFullYear();

  // storefront URLs are technically optional, and headless is OK.
  // In that case we'll assume the email template does not use nor need
  // the orderUrl property, so it will be null in the order email data object.
  let orderUrl = _.get(shop, "storefrontUrls.storefrontOrderUrl", null);
  if (orderUrl) {
    let token = "";
    orderUrl = orderUrl.replace(":orderId", encodeURIComponent(order.referenceId));
    const isAnonymous = !order.accountId;
    const wantsToken = orderUrl.includes(":token");
    if (isAnonymous && wantsToken) {
      token = await addAnonymousOrderToken(context, order._id);
    }
    // Replace :token either with empty string or a toke
    orderUrl = orderUrl.replace(":token", encodeURIComponent(token));
  }

  const physicalAddress = (shop.addressBook && shop.addressBook[0]) || null;
  if (physicalAddress) {
    physicalAddress.address = `${physicalAddress.address1}${physicalAddress.address2 ? ` ${physicalAddress.address2}` : ""}`;
  }

  // Merge data into single object to pass to email template
  return {
    account,
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
    contactEmail: shop.emails[0].address,
    copyrightDate,
    homepage: _.get(shop, "storefrontUrls.storefrontHomeUrl", null),
    legalName: _.get(shop, "addressBook[0].company"),
    order: {
      ...order,
      shipping: adjustedOrderGroups
    },
    orderDate: formatDateForEmail(order.createdAt),
    orderUrl,
    physicalAddress,
    shipping: {
      address: shippingAddressForEmail,
      carrier,
      tracking
    },
    shop,
    shopName: shop.name,
    socialLinks: {
      display: false
    }
  };
}

import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Media } from "/imports/plugins/core/files/server";

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
 * @name orders/sendNotification
 * @method
 * @memberof Orders/Methods
 * @summary send order notification email
 * @param {Object} order - order object
 * @param {Object} action - send notification action
 * @return {Boolean} email sent or not
 */
export default function sendNotification(order, action) {
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
  // in multi-shop mode, the currency object is different across shops
  // and it's inconsistent, i.e. sometimes there's no exchangeRate field in the secondary
  // shop's currency array.
  // TODO: Remove billing[0] and properly acquire userCurrency and exchange rate
  const userCurrencyFormatting = _.omit(shop.currencies[order.billing[0].currency.userCurrency], ["enabled", "rate"]);

  // Get user currency exchange rate at time of transaction
  const userCurrencyExchangeRate = order.billing[0].currency.exchangeRate;

  // Combine same products into single "product" for display purposes
  const combinedItems = [];
  if (order) {
    // Loop through all items in the order. The items are split into individual items
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
        orderItem.variants.displayPrice = accounting.formatMoney(
          orderItem.variants.price * userCurrencyExchangeRate,
          userCurrencyFormatting
        );

        combinedItems.push(orderItem);

        // Placeholder image if there is no product image
        orderItem.placeholderImage = `${Reaction.absoluteUrl()}resources/placeholder.gif`;

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
      homepage: Reaction.absoluteUrl(),
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
        total: accounting.formatMoney(
          (subtotal + shippingCost + taxes - discounts) * userCurrencyExchangeRate,
          userCurrencyFormatting
        ),
        adjustedTotal: accounting.formatMoney(
          (amount - refundTotal) * userCurrencyExchangeRate,
          userCurrencyFormatting
        )
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
}

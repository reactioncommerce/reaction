import Logger from "@reactioncommerce/logger";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";

/**
 * @summary Sends an email about an order.
 * @param {Object} order - The order document
 * @param {String} [action] - The action triggering the email
 * @returns {Boolean} True if sent; else false
 */
export default function sendOrderEmail(order, action) {
  // anonymous account orders without emails.
  const to = order.email;
  if (!to) {
    Logger.info("No order email found. No email sent.");
    return false;
  }

  const context = Promise.await(getGraphQLContextInMeteorMethod(null));

  const registeredFuncs = context.getFunctionsOfType("getDataForOrderEmail");
  const getDataForOrderEmail = registeredFuncs[0];
  if (!getDataForOrderEmail) {
    Logger.warn("Cannot send email because no function of type `getDataForOrderEmail` is registered.");
    return false;
  } else if (registeredFuncs.length > 1) {
    Logger.warn("Plugins registered more than one function of type `getDataForOrderEmail`. Using the first one.");
  }

  const dataForEmail = Promise.await(getDataForOrderEmail(context, { order }));

  Promise.await(context.mutations.sendOrderEmail(context, {
    action,
    dataForEmail,
    fromShop: dataForEmail.shop,
    to
  }));

  return true;
}

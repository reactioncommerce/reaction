import Logger from "@reactioncommerce/logger";

/**
 * @summary Sends an email about an order.
 * @param {Object} context App context
 * @param {Object} order - The order document
 * @param {String} [action] - The action triggering the email
 * @returns {Boolean} True if sent; else false
 */
export default async function sendOrderEmail(context, order, action) {
  // anonymous account orders without emails.
  const to = order.email;
  if (!to) {
    Logger.info("No order email found. No email sent.");
    return false;
  }

  const registeredFuncs = context.getFunctionsOfType("getDataForOrderEmail");
  const getDataForOrderEmail = registeredFuncs[0];
  if (!getDataForOrderEmail) {
    Logger.warn("Cannot send email because no function of type `getDataForOrderEmail` is registered.");
    return false;
  }

  if (registeredFuncs.length > 1) {
    Logger.warn("Plugins registered more than one function of type `getDataForOrderEmail`. Using the first one.");
  }

  const dataForEmail = await getDataForOrderEmail(context, { order });

  await context.mutations.sendOrderEmail(context, {
    action,
    dataForEmail,
    fromShop: dataForEmail.shop,
    to
  });

  return true;
}

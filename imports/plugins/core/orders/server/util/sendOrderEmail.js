import Logger from "@reactioncommerce/logger";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import getDataForEmail from "../no-meteor/util/getDataForEmail";

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
  const dataForEmail = Promise.await(getDataForEmail(context, order));

  Promise.await(context.mutations.sendOrderEmail(context, {
    action,
    dataForEmail,
    fromShop: dataForEmail.shop,
    to
  }));

  return true;
}

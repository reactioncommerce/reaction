import { getWebhooksByShopId } from "../repository/webhook.js";

/**
 * @name webhooksByShopId
 * @method
 * @summary query the Webhooks collection by a shopId
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - shopId for which webhooks to get
 * @returns {Promise<Array<Webhook>>} - Array of webhooks
 */
export default async function webhooksByShopId(context, shopId) {
  return getWebhooksByShopId(shopId, context);
}

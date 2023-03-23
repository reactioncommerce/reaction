import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name webhooksByShopId
 * @method
 * @memberof Webhook/GraphQL
 * @summary Returns webhooks, based on shopId
 * @param {Object} _ - unused
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - shopId
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object[]>} Promise that resolves with array of Webhook objects
 */
export default async function webhooksByShopId(_, params, context) {
  const {
    shopId: opaqueShopId
  } = params;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  return context.queries.webhooksByShopId(context, shopId);
}

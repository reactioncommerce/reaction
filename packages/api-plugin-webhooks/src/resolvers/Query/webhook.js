import { decodeWebhookOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/webhook
 * @method
 * @memberof Webhook/GraphQL
 * @summary Returns a webhook, based on ID
 * @param {Object} _ - unused
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.id] - Webhook id
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Promise that resolves with Webhook object
 */
export default async function webhook(_, params, context) {
  return context.queries.webhook(context, params);
}

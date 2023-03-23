import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.registerWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Register a webhook
 * @param {Object} parentResult - unused
 * @param {Object} args.input - RegisterWebhookInput
 * @param {String} args.input.topic - topic for which this webhook will be subscribed to
 * @param {String} args.input.address - outbound URL that this webhook is going to call
 * @param {String} args.input.shopId - shop for which the webhook to be registered
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} RegisterWebhookPayload
 */
export default async function registerWebhook(parentResult, { input }, context) {
  const {
    shopId: opaqueShopId
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const webhook = await context.mutations.registerWebhook(context, { ...input, shopId });

  return {
    webhook
  };
}

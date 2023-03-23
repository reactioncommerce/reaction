import {
  decodeShopOpaqueId
} from "../../xforms/id.js";

/**
 * @name Mutation.updateWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Update a specified redirect rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - UpdateWebhookInput
 * @param {String} args.input.id - webhook id
 * @param {String} args.input.shopId - shop id
 * @param {String} args.input.address - webhook address
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateWebhookPayload
 */
export default async function updateWebhook(parentResult, { input }, context) {
  const {
    shopId: opaqueShopId,
    ...webhookInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const webhook = await context.mutations.updateWebhook(context, {
    shopId,
    ...webhookInput
  });

  return {
    webhook
  };
}

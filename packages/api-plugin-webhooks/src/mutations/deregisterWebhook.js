import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name Mutation.deregisterWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Deregister a webhook
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} DeregisterWebhookPayload
 */
export default async function deregisterWebhook(context, input) {
  const { id } = input;
  const { Webhooks } = context.collections;

  const webhook = await Webhooks.findOne({ _id: id });
  const { result } = await Webhooks.deleteOne({ _id: id });

  if (result.n === 0) {
    throw new ReactionError("not-found", `Webhook ${id} not found`);
  }

  return webhook;
}

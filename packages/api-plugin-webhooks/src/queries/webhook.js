import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name webhook
 * @method
 * @summary query the Webhooks collection and return a webhook by ID
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input input of webhook query
 * @param {String} input.id - ID to query
 * @returns {Object} - A Webhook document if one was found
 */
export default async function webhook(context, input) {
  const { collections } = context;
  const { Webhooks } = collections;
  const { id } = input;

  const foundWebhook = await Webhooks.findOne({
    _id: id
  });

  if (!foundWebhook) {
    throw new ReactionError("not-found", `Webhook ${id} not found`);
  }

  return foundWebhook;
}

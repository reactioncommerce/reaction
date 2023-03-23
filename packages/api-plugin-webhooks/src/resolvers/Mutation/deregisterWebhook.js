/**
 * @name Mutation.deregisterWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Deregister a webhook
 * @param {Object} parentResult - unused
 * @param {Object} args.input - DeregisterWebhookInput
 * @param {String} args.input.id - id of the webhook to remove
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} DeregisterWebhookPayload
 */
export default async function deregisterWebhook(parentResult, { input }, context) {
  const webhook = await context.mutations.deregisterWebhook(context, input);

  return {
    webhook
  };
}

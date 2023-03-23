import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Webhook as WebhookSchema } from "../simpleSchemas.js";
import { stripLastChar } from "../util/util.js";
import { validateTopic } from "../util/validator.js";

/**
 * @name Mutation.registerWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Register a webhook
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} RegisterWebhookPayload
 */
export default async function registerWebhook(context, input) {
  const { address, topic, shopId } = input;
  const { collections } = context;
  const { Webhooks } = collections;

  const now = new Date();

  const webhook = {
    _id: Random.id(),
    shopId,
    address,
    topic,
    failureCounter: 0,
    createdAt: now,
    updatedAt: now
  };

  WebhookSchema.validate(webhook);

  if (!validateTopic(topic)) {
    throw new ReactionError("invalid-topic", `Invalid topic ${topic}`);
  }

  if (webhook.address && webhook.address.endsWith("/")) {
    webhook.address = stripLastChar(webhook.address);
  }

  try {
    const { result } = await Webhooks.insertOne(webhook);

    if (result.ok !== 1) {
      throw new ReactionError("server-error", "Unable to create webhook");
    }

    return webhook;
  } catch ({ message }) {
    throw new ReactionError("error", message);
  }
}

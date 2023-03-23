import ReactionError from "@reactioncommerce/reaction-error";
import { stripLastChar } from "../util/util.js";

/**
 * @name Mutation.updateWebhook
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} UpdateWebhookPayload
 */
export default async function updateWebhook(context, input) {
  const { collections } = context;
  const { Webhooks } = collections;
  const { shopId, id, address } = input;

  const params = {
    shopId,
    address,
    updatedAt: new Date()
  };

  if (!params.address) {
    throw new ReactionError("invalid-address", "Invalid address");
  }

  if (params.address.endsWith("/")) {
    params.address = stripLastChar(params.address);
  }

  try {
    const { result } = await Webhooks.updateOne(
      { _id: id },
      { $set: params }
    );

    if (result.n === 0) {
      throw new ReactionError("not-found", "Webhook couldn't be updated, or doesn't exist");
    }

    return await Webhooks.findOne({ _id: id });
  } catch ({ message }) {
    throw new ReactionError("error", message);
  }
}

import { decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/acknowledgeCartMessage
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the acknowledgeCartMessage GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.input - The input object
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>|undefined} A Cart object
 */
export default async function acknowledgeCartMessage(parentResult, { input }, context) {
  const { appEvents, userId = null } = context;
  const { cartId, messageId, clientMutationId = null, cartToken } = input;

  const { cart } = await context.mutations.acknowledgeCartMessage(context, {
    cartId: decodeCartOpaqueId(cartId),
    messageId,
    cartToken
  });

  appEvents.emit("afterCartUpdate", {
    cart,
    updatedBy: userId
  });

  return {
    cart,
    clientMutationId
  };
}

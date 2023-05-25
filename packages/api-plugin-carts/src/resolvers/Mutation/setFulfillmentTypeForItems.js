import { decodeCartItemOpaqueId, decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/setFulfillmentTypeForItems
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the setFulfillmentTypeForItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The opaque ID of the cart to add the items to.
 * @param {String} args.input.cartToken - The anonymous access cartToken that was returned from `createCart`.
 * @param {String} args.input.fulfillmentType - The fulfillment type to be set fo all items.
 * @param {String} [args.input.itemIds] - An array of cart items to be assigned to the fulfillment type.
 * @param {String} args.input.clientMutationId - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} setFulfillmentTypeForItemsPayload
 */
export default async function setFulfillmentTypeForItems(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, fulfillmentType, itemIds: itemsInput, cartToken } = input;
  const cartId = decodeCartOpaqueId(opaqueCartId);
  const itemIds = itemsInput.map((item) => (decodeCartItemOpaqueId(item)));

  const {
    cart
  } = await context.mutations.setFulfillmentTypeForItems(context, {
    cartId,
    fulfillmentType,
    itemIds,
    cartToken
  });

  return {
    cart,
    clientMutationId
  };
}

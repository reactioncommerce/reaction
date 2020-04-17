import { decodeCartItemsOpaqueIds, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/createCart
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the createCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.items - An array of cart items to add to the new cart. Must not be empty.
 * @param {String} args.input.shopId - The ID of the shop that will own this cart
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateCartPayload
 */
export default async function createCart(parentResult, { input }, context) {
  const { clientMutationId = null, items: itemsInput, shopId: opaqueShopId } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);
  const items = decodeCartItemsOpaqueIds(itemsInput);

  const {
    cart,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    token
  } = await context.mutations.createCart(context, {
    items,
    shopId
  });

  return {
    cart,
    clientMutationId,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    token
  };
}

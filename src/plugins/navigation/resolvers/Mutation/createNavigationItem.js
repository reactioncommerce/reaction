import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavigationItem GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.navigationItem The navigation item to add
 * @param {String} input.shopId ID of the shop navigation item belongs
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} CreateNavigationItemPayload
 */
export default async function createNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    navigationItem,
    shopId
  } = input;

  const newNavigationItem = await context.mutations.createNavigationItem(context, {
    navigationItem,
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    navigationItem: newNavigationItem
  };
}

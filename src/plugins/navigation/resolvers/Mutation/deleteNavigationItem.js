import { decodeNavigationItemOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.deleteNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for deleteNavigation GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input._id ID of the navigation item to delete
 * @param {String} args.input.shopId ID of the shop navigation item belongs
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} DeleteNavigationItemPayload
 */
export default async function deleteNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    _id,
    shopId
  } = input;

  const deletedNavigationItem = await context.mutations.deleteNavigationItem(context, {
    _id: decodeNavigationItemOpaqueId(_id),
    shopId: decodeShopOpaqueId(shopId)
  });

  return {
    clientMutationId,
    navigationItem: deletedNavigationItem
  };
}

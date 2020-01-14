import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createNavigationTree
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavigationTree GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.id ID of the navigation tree to update
 * @param {String} args.input.shopId Shop ID of the navigation tree to publish changes
 * @param {String} args.input.navigationTree The updated navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @returns {Promise<Object>} CreateNavigationTreePayload
 */
export default async function createNavigationTree(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId,
    navigationTree
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const updatedNavigationTree = await context.mutations.createNavigationTree(context, {
    shopId,
    navigationTree
  });

  return {
    clientMutationId,
    navigationTree: updatedNavigationTree
  };
}

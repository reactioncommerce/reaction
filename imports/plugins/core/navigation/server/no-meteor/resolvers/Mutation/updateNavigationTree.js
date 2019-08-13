import { decodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";

/**
 * @name Mutation.updateNavigationTree
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for updateNavigationTree GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input._id ID of the navigation tree to update
 * @param {String} args.input.navigationTree The updated navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @returns {Promise<Object>} UpdateNavigationTreePayload
 */
export default async function updateNavigationTree(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    _id,
    navigationTree
  } = input;

  const decodedId = decodeNavigationTreeOpaqueId(_id);

  const updatedNavigationTree = await context.mutations.updateNavigationTree(context, decodedId, navigationTree);

  return {
    clientMutationId,
    navigationTree: updatedNavigationTree
  };
}

import { decodeNavigationItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationItem";

/**
 * @name Mutation.updateNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for updateNavigationItem GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input._id ID of the navigation item to update
 * @param {String} args.input.navigationItem The updated navigation item
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} UpdateNavigationItemPayload
 */
export default async function updateNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    _id,
    navigationItem
  } = input;

  const decodedId = decodeNavigationItemOpaqueId(_id);

  const updatedNavigationItem = await context.mutations.updateNavigationItem(context, decodedId, navigationItem);

  return {
    clientMutationId,
    navigationItem: updatedNavigationItem
  };
}

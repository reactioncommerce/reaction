import { decodeNavigationItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationItem";

/**
 * @name Mutation.deleteNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for deleteNavigation GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input._id ID of the navigation item to delete
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} DeleteNavigationItemPayload
 */
export default async function deleteNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    _id
  } = input;

  const decodedId = decodeNavigationItemOpaqueId(_id);

  const deletedNavigationItem = await context.mutations.deleteNavigationItem(context, decodedId);

  return {
    clientMutationId,
    navigationItem: deletedNavigationItem
  };
}

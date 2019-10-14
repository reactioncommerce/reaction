import { decodeNavigationTreeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/navigationTree";

/**
 * @name Mutation.publishNavigationChanges
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for publishNavigationChanges GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input._id ID of the navigation tree to publish changes
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} PublishNavigationTreePayload
 */
export default async function publishNavigationChanges(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    _id
  } = input;

  const decodedId = decodeNavigationTreeOpaqueId(_id);

  const publishedNavigationTree = context.mutations.publishNavigationChanges(context, decodedId);

  return {
    clientMutationId,
    navigationTree: publishedNavigationTree
  };
}

/**
 * @name Mutation.createNavigationItem
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavigationItem GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.navigationItem The navigation item to add
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} CreateNavigationItemPayload
 */
export default async function createNavigationItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    navigationItem
  } = input;

  const newNavigationItem = await context.mutations.createNavigationItem(context, navigationItem);

  return {
    clientMutationId,
    navigationItem: newNavigationItem
  };
}

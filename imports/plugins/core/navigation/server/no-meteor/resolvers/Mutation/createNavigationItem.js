/**
 * @name "Mutation.createNavigationItem"
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavigationItem GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.navigationItem - The navigation item to add
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} NavigationItemPayload
 */
export default async function createNavigationItem(parentResult, { input: { navigationItem } }, context) {
  const newNavigationItem = await context.mutations.createNavigationItem(context, navigationItem);
  return { navigationItem: newNavigationItem };
}

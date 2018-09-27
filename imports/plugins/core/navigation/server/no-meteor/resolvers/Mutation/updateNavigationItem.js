

/**
 * @name "Mutation.updateNavigationItem"
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for updateNavigationItem GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.navigationItemId - ID of the navigation item to update
 * @param {String} args.input.navigationItem - the updated navigation item
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} NavigationItemPayload
 */
export default async function updateNavigationItem(parentResult, { input }, context) {
  const { navigationItemId, navigationItem } = input;
  const updatedNavigationItem = await context.mutations.updateNavigationItem(context, navigationItemId, navigationItem);
  return { navigationItem: updatedNavigationItem };
}

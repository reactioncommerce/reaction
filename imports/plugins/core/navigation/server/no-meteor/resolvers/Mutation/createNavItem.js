/**
 * @name "Mutation.createNavItem"
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavItem GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.navItem - The nav item to add
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} NavItemPayload
 */
export default async function createNavItem(parentResult, { input }, context) {
  const navItem = await context.mutations.createNavItem(context, input);
  return { navItem };
}

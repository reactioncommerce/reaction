/**
 * @name Shop/defaultNavigationTree
 * @method
 * @memberof Shop/GraphQL
 * @summary Returns the default navigation tree for a shop
 * @param {Object} shop The current shop
 * @param {Object} args - An object of all arguments that were sent by the previous resolver
 * @param {String} args.id The ID of the navigation tree
 * @param {String} args.language The language to load items in
 * @param {Boolean} args.shouldIncludeSecondary Include secondary navigation items alongside primary items
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object[]>} Promise that resolves to a navigation tree document
 */
export default async function defaultNavigationTree(shop, args, context) {
  const { defaultNavigationTreeId: navigationTreeId } = shop;
  const { language, shouldIncludeSecondary } = args;

  if (!navigationTreeId) {
    return null;
  }

  return context.queries.navigationTreeById(context, {
    language,
    navigationTreeId,
    shouldIncludeSecondary
  });
}

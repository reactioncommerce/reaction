/**
 * @name "Shop.defaultNavigationTree"
 * @method
 * @memberof Shop/GraphQL
 * @summary Returns the default navigation tree for a shop
 * @param {Object} shop The current shop
 * @param {Objec} args Unused
 * @param {Object} context An object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves to a navigation tree document
 */
export default async function defaultNavigationTree(shop, args, context) {
  const { defaultNavigationTreeId } = shop;

  if (!defaultNavigationTreeId) {
    return;
  }

  return context.queries.navigationTreeById(context, args.language, defaultNavigationTreeId);
}

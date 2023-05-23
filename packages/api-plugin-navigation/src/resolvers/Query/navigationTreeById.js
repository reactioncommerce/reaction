import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeNavigationTreeOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.navigationTreeById
 * @method
 * @memberof Navigation/GraphQL
 * @summary Returns a navigation tree by its ID in the specified language
 * @param {Object} _ unused
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {String} args.id The ID of the navigation tree
 * @param {String} args.language The language to load items in
 * @param {String} args.shopId Shop ID Navigation tree belongs to
 * @param {Boolean} args.shouldIncludeSecondary Include secondary navigation items alongside primary items
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} A NavigationTree object
 */
export default async function navigationTreeById(_, args, context) {
  const { id, language, shopId, shouldIncludeSecondary } = args;

  return context.queries.navigationTreeById(context, {
    language,
    navigationTreeId: isOpaqueId(id) ? decodeNavigationTreeOpaqueId(id) : id,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId,
    shouldIncludeSecondary
  });
}

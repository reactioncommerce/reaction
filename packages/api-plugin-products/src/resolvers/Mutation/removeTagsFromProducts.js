import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId, decodeProductOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

/**
 *
 * @method removeTagsFromProducts
 * @summary Takes an array of productsIds and tagsIds
 * and removes provided tags from the array of products.
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.productIds - an array of Product IDs
 * @param {String} args.input.shopId - the shop id
 * @param {String[]} args.input.tagIds - an array of Tag IDs
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with information about the results
 * of the bulk operation
 */
export default async function removeTagsFromProducts(_, { input }, context) {
  const { clientMutationId } = input;
  const { productIds: opaqueProductIds, shopId: opaqueShopId, tagIds: opaqueTagIds } = input;
  const productIds = opaqueProductIds.map((opaqueProductId) => (isOpaqueId(opaqueProductId) ? decodeProductOpaqueId(opaqueProductId) : opaqueProductId));
  const tagIds = opaqueTagIds.map((opaqueTagId) => (isOpaqueId(opaqueTagId) ? decodeTagOpaqueId(opaqueTagId) : opaqueTagId));

  const results = await context.mutations.removeTagsFromProducts(context, {
    productIds,
    shopId: isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId,
    tagIds
  });

  return {
    clientMutationId,
    ...results
  };
}

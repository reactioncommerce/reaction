import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeProductOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/product
 * @method
 * @memberof Product/Query
 * @summary query the Products collection for a single product
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.productId - Product id
 * @param {String} args.shopId - Shop id of the product
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Products
 */
export default async function product(_, args, context) {
  const {
    productId: opaqueProductId,
    shopId: opaqueShopId
  } = args;

  const productId = isOpaqueId(opaqueProductId) ? decodeProductOpaqueId(opaqueProductId) : opaqueProductId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  return context.queries.product(context, {
    productId,
    shopId
  });
}

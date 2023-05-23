import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";

const decodeProductOpaqueId = decodeOpaqueIdForNamespace("reaction/product");
const decodeShopOpaqueId = decodeOpaqueIdForNamespace("reaction/shop");

/**
 * @name Query/simpleInventory
 * @summary Gets SimpleInventory data for a product configuration
 * @param {Object} _ unused
 * @param {Object} args Args passed by the client
 * @param {String} args.shopId Shop ID
 * @param {Object} args.productConfiguration Product configuration object
 * @param {Object} context App context
 * @returns {Object|null} SimpleInventory info
 */
export default async function simpleInventory(_, args, context) {
  const { productConfiguration, shopId: opaqueShopId } = args;

  const productId = isOpaqueId(productConfiguration.productId) ?
    decodeProductOpaqueId(productConfiguration.productId) : productConfiguration.productId;
  const productVariantId = isOpaqueId(productConfiguration.productVariantId) ?
    decodeProductOpaqueId(productConfiguration.productVariantId) : productConfiguration.productVariantId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  return context.queries.simpleInventory(context, {
    productConfiguration: {
      productId,
      productVariantId
    },
    shopId
  });
}

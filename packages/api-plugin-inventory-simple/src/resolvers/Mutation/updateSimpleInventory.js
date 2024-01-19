import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";

const decodeProductOpaqueId = decodeOpaqueIdForNamespace("reaction/product");
const decodeShopOpaqueId = decodeOpaqueIdForNamespace("reaction/shop");

/**
 * @name Mutation/updateSimpleInventory
 * @summary Updates SimpleInventory data for a product configuration. Pass only
 *   those arguments you want to update.
 * @param {Object} _ unused
 * @param {Object} args Args passed by the client
 * @param {Object} args.input Input
 * @param {Object} args.input.productConfiguration Product configuration object
 * @param {Object} context App context
 * @returns {Object} Updated inventory values
 */
export default async function updateSimpleInventory(_, { input }, context) {
  const { clientMutationId = null, productConfiguration, shopId: opaqueShopId, ...passThroughInput } = input;

  const productId = isOpaqueId(productConfiguration.productId) ?
    decodeProductOpaqueId(productConfiguration.productId) : productConfiguration.productId;
  const productVariantId = isOpaqueId(productConfiguration.productVariantId) ?
    decodeProductOpaqueId(productConfiguration.productVariantId) : productConfiguration.productVariantId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const inventoryInfo = await context.mutations.updateSimpleInventory(context, {
    ...passThroughInput,
    productConfiguration: {
      productId,
      productVariantId
    },
    shopId
  });

  return {
    clientMutationId,
    inventoryInfo
  };
}

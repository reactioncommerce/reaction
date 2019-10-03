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

  const productId = decodeProductOpaqueId(productConfiguration.productId);
  const productVariantId = decodeProductOpaqueId(productConfiguration.productVariantId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

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

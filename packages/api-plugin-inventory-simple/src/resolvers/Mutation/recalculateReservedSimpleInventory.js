import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";

const decodeProductOpaqueId = decodeOpaqueIdForNamespace("reaction/product");
const decodeShopOpaqueId = decodeOpaqueIdForNamespace("reaction/shop");

/**
 * @name Mutation/recalculateReservedSimpleInventory
 * @summary Force recalculation of the system-managed `inventoryReserved` field based on current order statuses.
 * @param {Object} _ unused
 * @param {Object} args Args passed by the client
 * @param {Object} args.input Input
 * @param {Object} args.input.productConfiguration Product configuration object
 * @param {String} args.input.shopId ID of shop that owns the product
 * @param {Object} context App context
 * @returns {Object} Updated inventory values
 */
export default async function recalculateReservedSimpleInventory(_, { input }, context) {
  const { clientMutationId = null, productConfiguration, shopId: opaqueShopId, ...passThroughInput } = input;

  const productId = isOpaqueId(productConfiguration.productId) ?
    decodeProductOpaqueId(productConfiguration.productId) : productConfiguration.productId;
  const productVariantId = isOpaqueId(productConfiguration.productVariantId) ?
    decodeProductOpaqueId(productConfiguration.productVariantId) : productConfiguration.productVariantId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const inventoryInfo = await context.mutations.recalculateReservedSimpleInventory(context, {
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

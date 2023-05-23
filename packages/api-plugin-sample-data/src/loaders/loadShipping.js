import ShippingMethodData from "../json-data/ShippingMethod.json" assert { type: "json" };

/**
 * @summary load a single Shipping entry
 * @param {object} context - The application context
 * @param {string} shopId - The shop ID
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadShipping(context, shopId) {
  const shippingMethodInput = {
    shopId,
    method: ShippingMethodData
  };
  await context.mutations.createFlatRateFulfillmentMethod(context.getInternalContext(), shippingMethodInput);
}

import ShippingMethodData from "../json-data/ShippingMethod.json";

const now = new Date();

/**
 * @summary load a single Shipping entry
 * @param {object} context - The application context
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadShipping(context, shopId) {

  const shippingMethodInput = {
    shopId: shopId,
    method: ShippingMethodData
  }
  await context.mutations.createFlatRateFulfillmentMethod(context.getInternalContext(), shippingMethodInput);
}

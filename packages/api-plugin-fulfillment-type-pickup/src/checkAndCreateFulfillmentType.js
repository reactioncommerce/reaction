/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {String} shopId Shop ID
 * @returns {Boolean} true if entry exist or insert success else false
 */
export default async function checkAndCreateFulfillmentType(context, shopId) {
  const { collections: { Fulfillment } } = context;

  const pickupFulfillmentType = await Fulfillment.findOne({ fulfillmentType: "pickup", shopId });
  if (pickupFulfillmentType) return true;
  const newPickupFulfillmentType = {
    name: "Pickup Provider",
    shopId,
    provider: {
      enabled: true,
      label: "Pickup",
      name: "pickup"
    },
    fulfillmentType: "pickup"
  };
  await context.mutations.createFulfillmentType(context.getInternalContext(), newPickupFulfillmentType);
  return true;
}

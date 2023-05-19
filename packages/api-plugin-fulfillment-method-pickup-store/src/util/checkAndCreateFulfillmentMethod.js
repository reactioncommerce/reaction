import ReactionError from "@reactioncommerce/reaction-error";
/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {String} shopId Shop ID
 * @returns {Boolean} true if entry exist or insert success else false
 */
export default async function checkAndCreateFulfillmentMethod(context, shopId) {
  const { collections: { Fulfillment } } = context;

  const pickupRecord = await Fulfillment.findOne({ fulfillmentType: "pickup", shopId });
  if (!pickupRecord) throw new ReactionError("server-error", "Unable to create fulfillment method Pickup-Store without defined type");

  const fulfillmentTypeId = pickupRecord._id;
  const method = {
    name: "store",
    label: "Pickup from Store",
    fulfillmentTypes: ["pickup"],
    group: "Ground",
    cost: 0,
    handling: 0,
    rate: 0,
    enabled: true,
    fulfillmentMethod: "store",
    displayMessageMethod: "Placeholder for display message"
  };

  await context.mutations.createFulfillmentMethod(context.getInternalContext(), { shopId, fulfillmentTypeId, method });
  return { method };
}

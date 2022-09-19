import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentMethodPickupStoreStartup(context) {
  const { collections } = context;
  const { Fulfillment } = collections;

  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;
    const method = {};

    // We do not have validatePermissions in context during this startup stage, hence commenting below
    // await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

    const pickupRecord = await Fulfillment.findOne({ fulfillmentType: "pickup", shopId });
    if (!pickupRecord) throw new ReactionError("server-error", "Unable to create fulfillment method Pickup-Store without defined type");

    const fulfillmentTypeId = pickupRecord._id;
    method.name = "store";
    method.label = "Pickup from Store";
    method.fulfillmentTypes = ["pickup"];
    method.group = "Ground";
    method.cost = 0;
    method.handling = 0;
    method.rate = 0;
    method.enabled = true;
    method.fulfillmentMethod = "store";
    method.displayMessageMethod = "Placeholder for display message";

    await context.mutations.createFulfillmentMethod(context.getInternalContext(), { shopId, fulfillmentTypeId, method });
    return { method };
  });
}

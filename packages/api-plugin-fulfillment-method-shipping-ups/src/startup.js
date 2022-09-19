import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentMethodShippingUPSStartup(context) {
  const { collections } = context;
  const { Fulfillment } = collections;

  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;
    const method = {};

    // We do not have validatePermissions in context during this startup stage, hence commenting below
    // await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

    const shippingRecord = await Fulfillment.findOne({ fulfillmentType: "shipping", shopId });
    if (!shippingRecord) throw new ReactionError("server-error", "Unable to create fulfillment method Shipping-UPS without defined type");

    const fulfillmentTypeId = shippingRecord._id;
    method.name = "ups";
    method.label = "Shipping via UPS";
    method.fulfillmentTypes = ["shipping"];
    method.group = "Ground";
    method.cost = 0;
    method.handling = 0;
    method.rate = 0;
    method.enabled = true;
    method.fulfillmentMethod = "ups";
    method.displayMessageMethod = "Placeholder for display message";

    await context.mutations.createFulfillmentMethod(context.getInternalContext(), { shopId, fulfillmentTypeId, method });
    return { method };
  });
}

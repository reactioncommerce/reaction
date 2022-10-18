import Random from "@reactioncommerce/random";

/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentTypeShippingStartup(context) {
  const { collections } = context;
  const { Fulfillment } = collections;

  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    // We do not have validatePermissions in context during this startup stage, hence commenting below
    // await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

    const shippingRecord = await Fulfillment.findOne({ fulfillmentType: "shipping", shopId });
    if (!shippingRecord) {
      const groupInfo = {
        _id: Random.id(),
        name: "Shipping Provider",
        shopId,
        provider: {
          enabled: true,
          label: "Shipping",
          name: "shipping"
        },
        fulfillmentType: "shipping"
      };

      await context.mutations.createFulfillmentType(context.getInternalContext(), groupInfo);
    }
  });
}

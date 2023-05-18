/**
 * @summary Called on startup to creates root entry for undecided fulfillment type
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentTypeUndecidedStartup(context) {
  const { collections: { Fulfillment } } = context;

  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    const undecidedRecord = await Fulfillment.findOne({ fulfillmentType: "undecided", shopId });

    if (undecidedRecord) return;
    const fulfillmentTypeInfo = {
      name: "Undecided Type",
      shopId,
      provider: {
        enabled: true,
        label: "Undecided",
        name: "undecided"
      },
      fulfillmentType: "undecided"
    };
    await context.mutations.createFulfillmentType(context.getInternalContext(), fulfillmentTypeInfo);
  });
}

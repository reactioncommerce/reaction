
/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {String} shopId Shop ID
 * @returns {Boolean} true if entry exist or insert success else false
 */
export default async function checkAndCreateFulfillmentType(context, shopId) {
  const { collections: { Fulfillment } } = context;

  const shippingRecord = await Fulfillment.findOne({ fulfillmentType: "shipping", shopId });
  if (!shippingRecord) {
    const groupInfo = {
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
  return true;
}

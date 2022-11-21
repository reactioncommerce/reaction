import ReactionError from "@reactioncommerce/reaction-error";
/**
 * @summary Finds the corresponding ff-type and calls mutation to insert the ff-method
 * @param {Object} context Startup context
 * @param {String} shopId Shop ID
 * @returns {Object} method which was inserted
 */
export default async function checkAndCreateFulfillmentMethod(context, shopId) {
  const { collections: { Fulfillment } } = context;

  const shippingRecord = await Fulfillment.findOne({ fulfillmentType: "shipping", shopId });
  if (!shippingRecord) throw new ReactionError("server-error", "Unable to create fulfillment method Shipping-DynamicRate without defined type");

  const fulfillmentTypeId = shippingRecord._id;
  const method = {
    name: "dynamicRate",
    label: "Shipping using DynamicRate",
    fulfillmentTypes: ["shipping"],
    group: "Ground",
    cost: 0,
    handling: 0,
    rate: 0,
    enabled: true,
    fulfillmentMethod: "dynamicRate",
    displayMessageMethod: "Placeholder for display message"
  };

  await context.mutations.createFulfillmentMethod(context.getInternalContext(), { shopId, fulfillmentTypeId, method });
  return { method };
}

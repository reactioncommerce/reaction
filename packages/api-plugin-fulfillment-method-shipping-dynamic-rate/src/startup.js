import ReactionError from "@reactioncommerce/reaction-error";
import checkAndCreateFulfillmentMethod from "./util/checkAndCreateFulfillmentMethod.js";

/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentMethodShippingDynamicRateStartup(context) {
  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    // We do not have validatePermissions in context during this startup stage, hence commenting below
    // await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

    const insertedMethod = await checkAndCreateFulfillmentMethod(context, shopId);
    if (!insertedMethod) {
      throw new ReactionError("server-error", "Error in creating fulfillment method");
    }
  });
}

import ReactionError from "@reactioncommerce/reaction-error";
import checkAndCreateFulfillmentMethod from "./util/checkAndCreateFulfillmentMethod.js";
/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodPickupStoreStartup(context) {
  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    const insertedMethod = await checkAndCreateFulfillmentMethod(context, shopId);
    if (!insertedMethod) {
      throw new ReactionError("server-error", "Error in creating fulfillment method");
    }
  });
}

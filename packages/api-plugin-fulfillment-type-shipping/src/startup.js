import ReactionError from "@reactioncommerce/reaction-error";
import checkAndCreateFulfillmentType from "./checkAndCreateFulfillmentType.js";

/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentTypeShippingStartup(context) {
  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    const insertSuccess = await checkAndCreateFulfillmentType(context, shopId);
    if (!insertSuccess) {
      throw new ReactionError("server-error", "Error in creating fulfillment type");
    }
  });
}

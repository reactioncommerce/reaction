import ReactionError from "@reactioncommerce/reaction-error";
import checkAndCreateFulfillmentType from "./checkAndCreateFulfillmentType.js";
/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function fulfillmentTypePickupStartup(context) {
  const { collections: { Shops } } = context;
  const session = context.app.mongoClient.startSession();

  const allShops = await Shops.find().toArray();
  for (const shop of allShops) {
    const { _id: shopId } = shop;
    try {
      // eslint-disable-next-line no-await-in-loop
      await session.withTransaction(async () => {
        const insertedFulfillmentType = await checkAndCreateFulfillmentType(context, shopId);
        if (!insertedFulfillmentType) {
          throw new ReactionError("server-error", "Error in creating fulfillment method");
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      await session.endSession();
      throw error;
    }
    // eslint-disable-next-line no-await-in-loop
    await session.endSession();
  }

  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;
    const shopId = shop._id;

    const insertSuccess = await checkAndCreateFulfillmentType(context, shopId);
    if (!insertSuccess) {
      throw new ReactionError("server-error", "Error in creating fulfillment type");
    }
  });
}

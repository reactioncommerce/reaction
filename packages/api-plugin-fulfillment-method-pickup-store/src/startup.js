import ReactionError from "@reactioncommerce/reaction-error";
import checkAndCreateFulfillmentMethod from "./util/checkAndCreateFulfillmentMethod.js";
/**
 * @summary Called on startup to create the root entry of this fulfillment type in Fulfillment collection
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodPickupStoreStartup(context) {
  const { collections: { Shops } } = context;
  const session = context.app.mongoClient.startSession();

  const allShops = await Shops.find().toArray();
  for (const shop of allShops) {
    const { _id: shopId } = shop;
    try {
      // eslint-disable-next-line no-await-in-loop
      await session.withTransaction(async () => {
        const insertedMethod = await checkAndCreateFulfillmentMethod(context, shopId);
        if (!insertedMethod) {
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

    const insertedMethod = await checkAndCreateFulfillmentMethod(context, shopId);
    if (!insertedMethod) {
      throw new ReactionError("server-error", "Error in creating fulfillment method");
    }
  });
}

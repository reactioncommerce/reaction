/* eslint-disable no-await-in-loop */
import Random from "@reactioncommerce/random";
import config from "./config.js";

const { SEQUENCE_INITIAL_VALUES } = config;

/**
 * @summary create new sequence for a shop
 * @param {Object} context - The application context
 * @param {String} shopId - The shop ID
 * @return {Promise<void>} undefined
 */
async function createShopSequence(context, shopId) {
  const { sequenceConfigs, collections: { Sequences } } = context;

  for (const sequence of sequenceConfigs) {
    const { entity } = sequence;
    const existingSequence = await Sequences.findOne({ shopId, entity });
    if (!existingSequence) {
      // eslint-disable-next-line no-await-in-loop
      const startingValue = SEQUENCE_INITIAL_VALUES[entity] || 1000000;
      Sequences.insertOne({
        _id: Random.id(),
        shopId,
        entity,
        value: startingValue
      });
    }
  }
}

/**
 * @summary create new sequences if necessary
 * @param {Object} context - The application context
 * @return {Promise<void>} undefined
 */
export default async function startupSequences(context) {
  const { collections: { Shops } } = context;
  const session = context.app.mongoClient.startSession();

  const allShops = await Shops.find().toArray();
  for (const shop of allShops) {
    const { _id: shopId } = shop;
    try {
      await session.withTransaction(async () => {
        await createShopSequence(context, shopId);
      });
    } catch (error) {
      // eslint-disable-next-line no-await-in-loop
      await session.endSession();
      throw error;
    }
    // eslint-disable-next-line no-await-in-loop
    await session.endSession();
  }

  const { appEvents } = context;
  appEvents.on("afterShopCreate", async ({ shop }) => {
    await createShopSequence(context, shop._id);
  });
}

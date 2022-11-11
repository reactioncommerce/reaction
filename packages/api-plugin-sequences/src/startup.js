/* eslint-disable no-await-in-loop */
import Random from "@reactioncommerce/random";
import config from "./config.js";

const { SEQUENCE_INITIAL_VALUES } = config;

/**
 * @summary create new sequences if necessary
 * @param {Object} context - The application context
 * @return {Promise<void>} undefined
 */
export default async function startupSequences(context) {
  const session = context.app.mongoClient.startSession();
  const { Sequences, collections: { Sequences: SequenceCollection, Shops } } = context;
  const allShops = await Shops.find().toArray();
  for (const shop of allShops) {
    const { _id: shopId } = shop;
    for (const sequence of Sequences) {
      const { entity } = sequence;
      try {
        await session.withTransaction(async () => {
          // eslint-disable-next-line no-await-in-loop
          const existingSequence = await SequenceCollection.findOne({ shopId, entity });
          if (!existingSequence) {
            const startingValue = SEQUENCE_INITIAL_VALUES[entity] || 1000000;
            SequenceCollection.insertOne({
              _id: Random.id(),
              shopId,
              entity,
              value: startingValue
            });
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
  }
}

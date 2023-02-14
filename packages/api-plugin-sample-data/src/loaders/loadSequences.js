/* eslint-disable no-await-in-loop */
import Random from "@reactioncommerce/random";
import config from "../config.js";

const { SEQUENCE_INITIAL_VALUES } = config;

/**
 * @summary load Sequences data
 * @param {Object} context - The application context
 * @param {String} shopId - The Shop ID
 * @returns {void}
 */
export default async function loadSequences(context, shopId) {
  const { sequenceConfigs, collections: { Sequences } } = context;
  if (sequenceConfigs.length === 0) return;

  for (const sequence of sequenceConfigs) {
    const { entity } = sequence;
    const existingSequence = await Sequences.findOne({ shopId, entity });
    if (!existingSequence) {
      const startingValue = SEQUENCE_INITIAL_VALUES[entity] || 1000000;
      await Sequences.insertOne({
        _id: Random.id(),
        shopId,
        entity,
        value: startingValue
      });
    }
  }
}

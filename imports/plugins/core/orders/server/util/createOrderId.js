import Random from "@reactioncommerce/random";

/**
 * @summary create an order Id using the Random generator
 * @returns {String} - 17 Character Id similar to a Mongo Id
 */
export default function createRandomOrderId() {
  return Random.id();
}

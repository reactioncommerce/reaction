import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Location } from "../simpleSchemas.js";

/**
 * @summary create a new location
 * @param {Object} context - The application context
 * @param {Object} params.location - The location to create
 * @param {String} params.shopId - The shop to create the location for
 * @return {Promise<Object>} - The created location
 */
export default async function createLocation(context, { location, shopId }) {
  const { collections: { Locations, Shops } } = context;

  const shop = await Shops.findOne({ _id: shopId });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const id = Random.id();
  const now = new Date();

  location._id = id;
  location.enabled = false;
  location.createdAt = now;
  location.updatedAt = now;

  Location.validate(location);

  const results = await Locations.insertOne(location);
  const { insertedCount } = results;
  return { success: insertedCount === 1, location };
}

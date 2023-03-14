import { Location } from "../simpleSchemas.js";

/**
 * @summary update a single location
 * @param {Object} context - The application context
 * @param {Object} params.location - The location to create
 * @param {String} params.shopId - The shop to create the location for
 * @return {Promise<Object>} - The created location
 */
export default async function updateLocation(context, { location, shopId }) {
  const { collections: { Locations } } = context;

  const now = new Date();
  location.updatedAt = now;
  const modifier = { $set: location };

  Location.validate(modifier, { modifier: true });

  const { _id } = location;
  const results = await Locations.findOneAndUpdate({ _id, shopId }, modifier, { returnDocument: "after" });
  const { modifiedCount, value } = results;
  return { success: modifiedCount === 1, location: value };
}

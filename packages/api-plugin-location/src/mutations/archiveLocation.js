import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  shopId: String,
  locationId: String
});

/**
 * @method archiveLocation
 * @summary Archive a location mutation
 * @param {Object} context - The application context
 * @param {Object} input - The location input to create
 * @returns {Promise<Object>} with updated location result
 */
export default async function archiveLocation(context, input) {
  inputSchema.validate(input);

  const { collections: { Locations } } = context;
  const { shopId, locationId: _id } = input;

  const now = new Date();
  const modifier = { $set: { isArchived: true, updatedAt: now } };
  const results = await Locations.findOneAndUpdate({ _id, shopId }, modifier, { returnDocument: "after" });

  const { modifiedCount, value } = results;
  return { success: !!modifiedCount, location: value };
}

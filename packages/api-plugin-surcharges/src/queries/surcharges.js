import { checkPermission } from 'your-permissions-library'; // Replace with your actual permissions library

/**
 * @name surcharges
 * @method
 * @memberof Fulfillment/NoMeteorQueries
 * @summary Query the Surcharges collection for surcharges with the provided shopId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.shopId - Shop ID for the shop that owns the surcharges
 * @returns {Promise<Object>|undefined} - Surcharge documents, if found
 */
export default async function surcharges(context, { shopId } = {}) {
  const { collections, user } = context;
  const { Surcharges } = collections;

  // Check if the user has the read permission for surcharges (adjust this logic to your permission system)
  const hasReadPermission = checkPermission(user, 'surcharges:read');

  if (!hasReadPermission) {
    // User does not have the required permission, return an error or handle as needed
    throw new Error('Permission denied: You do not have permission to read surcharges.');
  }

  // Query the Surcharges collection
  return Surcharges.find({
    shopId,
  });
}

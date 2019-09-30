import ReactionError from "@reactioncommerce/reaction-error";
import { getAddressValidationService } from "../registration.js";

/**
 * @name addressValidation
 * @method
 * @summary Returns address validation results for an address.
 *   Call the first registered function of type "addressValidation".
 *   If none registered, returns an object with no suggestions and no errors,
 *   indicating the address is
 * @param {Object} input - Input object
 * @param {Object} input.address - The AddressInput to validate
 * @param {Object} input.shopId - The shop to use for address validation settings
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Promise that resolves with an object with results
 */
export default async function addressValidation({ address, shopId }, context) {
  const { collections } = context;
  const { Packages } = collections;

  const plugin = Packages.findOne({ name: "reaction-address", shopId });
  if (!plugin) {
    // This would be weird because we're in the "reaction-address" plugin, but you never know
    throw new ReactionError("internal-error", `reaction-address plugin not found for shop with ID ${shopId}`);
  }

  const validationService = await getAddressValidationService(context, shopId, address.country);

  if (!validationService) {
    return {
      suggestedAddresses: [],
      validationErrors: []
    };
  }

  return validationService.functions.addressValidation({ address, context });
}

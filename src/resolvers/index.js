import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Address from "./Address.js";
import AddressValidationRule from "./AddressValidationRule.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  Address,
  AddressValidationRule,
  Mutation,
  Query,
  ...getConnectionTypeResolvers("Address"),
  ...getConnectionTypeResolvers("AddressValidationRule")
};

/**
 * Arguments passed by the client a groups query
 * @memberof GraphQL
 * @typedef {Object} AddressInput - Address
 * @property {String} address1 - Address line 1
 * @property {String} [address2] - Address line 2
 * @property {String} city - City
 * @property {String} [company] - Company name
 * @property {String} country - Country
 * @property {Boolean} [failedValidation] - Mark address as failed validation by address validation service
 * @property {String} fullName - Full name
 * @property {String} [firstName] - First name
 * @property {String} [lastName] - Last name
 * @property {Boolean} isBillingDefault - Mark address as default for billing
 * @property {Boolean} isCommercial - Mask address as commercial
 * @property {Boolean} isShippingDefault -  Mark address as default for shipping
 * @property {Array<MetafieldInput>} metafields - Array of metafields
 * @property {String} phone - Phone number
 * @property {String} postal - Postal code
 * @property {String} region - Region of country
 */

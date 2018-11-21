import _ from "lodash";
import { addressValidationServices as addressValidationServicesObject } from "../registration";

/**
 * @name addressValidationServices
 * @method
 * @summary Returns all registered address validation services
 * @return {Promise<Object[]>} Promise that resolves with an object with results
 */
export default async function addressValidationServices() {
  // No permissions check necessary

  return _.sortBy(Object.values(addressValidationServicesObject), "displayName");
}

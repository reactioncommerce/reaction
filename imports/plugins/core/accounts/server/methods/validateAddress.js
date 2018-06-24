import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @name getValidator
 * @summary Returns the name of the geocoder method to use
 * @returns {string} Name of the Geocoder method to use
 * @private
 */
function getValidator() {
  const shopId = Reaction.getShopId();
  const geoCoders = Packages.find({
    "registry": { $elemMatch: { provides: "addressValidation" } },
    "settings.addressValidation.enabled": true,
    shopId,
    "enabled": true
  }).fetch();

  if (!geoCoders.length) {
    return "";
  }
  let geoCoder;
  // Just one?, use that one
  if (geoCoders.length === 1) {
    [geoCoder] = geoCoders;
  }
  // If there are two, we default to the one that is not the Reaction one
  if (geoCoders.length === 2) {
    geoCoder = geoCoders.find((coder) => !coder.name.includes("reaction"));
  }

  // check if addressValidation is enabled but the package is disabled, don't do address validation
  let registryName;
  for (const registry of geoCoder.registry) {
    if (registry.provides && registry.provides.includes("addressValidation")) {
      registryName = registry.name;
    }
  }
  const packageKey = registryName.split("/")[2]; // "taxes/addressValidation/{packageKey}"
  if (!_.get(geoCoder.settings[packageKey], "enabled")) {
    return "";
  }

  const methodName = geoCoder.settings.addressValidation.addressValidationMethod;
  return methodName;
}

/**
 * @name compareAddress
 * @summary Compare individual fields of address and accumulate errors
 * @param {Object} address - the address provided by the customer
 * @param {Object} validationAddress - address provided by validator
 * @returns {Object} An object with an array of errors per field
 * @private
 */
function compareAddress(address, validationAddress) {
  const errors = {
    address1: [],
    address2: [],
    city: [],
    postal: [],
    region: [],
    country: [],
    totalErrors: 0
  };
  // first check, if a field is missing (and was present in original address), that means it didn't validate
  // TODO rewrite with just a loop over field names but KISS for now
  if (address.address1 && !validationAddress.address1) {
    errors.address1.push("Address line one did not validate");
    errors.totalErrors += 1;
  }

  if (address.address2 && validationAddress.address2 && _.trim(_.upperCase(address.address2)) !== _.trim(_.upperCase(validationAddress.address2))) {
    errors.address2.push("Address line 2 did not validate");
    errors.totalErrors += 1;
  }

  if (!validationAddress.city) {
    errors.city.push("City did not validate");
    errors.totalErrors += 1;
  }
  if (address.postal && !validationAddress.postal) {
    errors.postal.push("Postal did not validate");
    errors.totalErrors += 1;
  }

  if (address.region && !validationAddress.region) {
    errors.region.push("Region did not validate");
    errors.totalErrors += 1;
  }

  if (address.country && !validationAddress.country) {
    errors.country.push("Country did not validate");
    errors.totalErrors += 1;
  }
  // second check if both fields exist, but they don't match (which almost always happen for certain fields on first time)
  if (validationAddress.address1 && address.address1 && _.trim(_.upperCase(address.address1)) !== _.trim(_.upperCase(validationAddress.address1))) {
    errors.address1.push({ address1: "Address line 1 did not match" });
    errors.totalErrors += 1;
  }

  if (validationAddress.address2 && address.address2 && (_.upperCase(address.address2) !== _.upperCase(validationAddress.address2))) {
    errors.address2.push("Address line 2 did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.city && address.city && _.trim(_.upperCase(address.city)) !== _.trim(_.upperCase(validationAddress.city))) {
    errors.city.push("City did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.postal && address.postal && _.trim(_.upperCase(address.postal)) !== _.trim(_.upperCase(validationAddress.postal))) {
    errors.postal.push("Postal Code did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.region && address.region && _.trim(_.upperCase(address.region)) !== _.trim(_.upperCase(validationAddress.region))) {
    errors.region.push("Region did not match");
    errors.totalErrors += 1;
  }

  if (validationAddress.country && address.country && _.upperCase(address.country) !== _.upperCase(validationAddress.country)) {
    errors.country.push("Country did not match");
    errors.totalErrors += 1;
  }
  return errors;
}

/**
 * @name accounts/validateAddress
 * @memberof Accounts/Methods
 * @method
 * @summary Validates an address, and if fails returns details of issues
 * @param {Object} address - The address object to validate
 * @returns {{validated: boolean, address: *}} - The results of the validation
 */
export default function validateAddress(address) {
  Schemas.Address.clean(address);
  Schemas.Address.validate(address);

  let validated = true;
  let validationErrors;
  let suggestedAddress = {};
  let formErrors;
  const validator = getValidator();
  if (validator) {
    const validationResult = Meteor.call(validator, address);
    ({ validatedAddress: suggestedAddress } = validationResult);
    formErrors = validationResult.errors;
    if (suggestedAddress) {
      validationErrors = compareAddress(address, suggestedAddress);
      if (validationErrors.totalErrors || formErrors.length) {
        validated = false;
        suggestedAddress.failedValidation = true;
      }
    } else {
      // No address, fail validation
      validated = false;
      suggestedAddress = {
        failedValidation: true
      };
    }
  }
  suggestedAddress = { ...address, ...suggestedAddress };
  const validationResults = { validated, fieldErrors: validationErrors, formErrors, suggestedAddress, enteredAddress: address };
  return validationResults;
}

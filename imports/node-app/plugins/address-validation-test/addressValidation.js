import faker from "faker";

/**
 * @file addressValidation - The purpose of this methods is only to create a
 * variety of `AddressValidationResults` and not doing any actual address validation.
 * Using the provided `address.postal` code we return several different types of validation results
 * `address.postal` codes beginning with "9" will always return as valid.
 * @namespace AddressValidationTest
 */

/**
 *
 * @const {Object[]} - array of generic validation errors objects
 */
const fakeValidationErrors = [
  {
    summary: "The address is not deliverable.",
    details: "The physical location exists but there are no homes on this street. One reason might be " +
      "railroad tracks or rivers running alongside this street, as they would prevent construction of " +
      "homes in this location.",
    type: "error",
    source: "Validation.Taxes.Services.Address"
  },
  {
    summary: "Address Not Found",
    details: "The address as submitted could not be found. Please check for excessive abbreviations in " +
      "the street address line or in the City name.",
    source: "USPS",
    type: "error"
  },
  {
    summary: "Incomplete Address",
    details: "The address matched multiple records, please enter more information to locate a unique address.",
    source: "Shipping",
    type: "error"
  },
  {
    summary: "Invalid Address",
    details: "The address could not be verified at least up to the postal code level.",
    source: "DHL",
    type: "error"
  },
  {
    summary: "Address correction",
    details: "Please use request address section from Address validation service response. " +
      "It will have standardized address (like 9 digit zip code)",
    source: "Radial",
    type: "error"
  }
];

/**
 *
 * @const {Object[]} - array of suggested address objects
 */
const fakeAddresses = [];
// creating 8 fake addresses
for (let index = 0; index < 9; index += 1) {
  const randNum = Math.floor(Math.random() * 100 + 1);
  fakeAddresses.push({
    address1: faker.address.streetAddress(),
    address2: randNum % 2 === 0 ? faker.address.secondaryAddress() : "",
    country: faker.address.countryCode(),
    city: faker.address.city(),
    postal: faker.address.zipCode(),
    region: faker.address.stateAbbr()
  });
}

/**
 *
 * @method getSuggestedAddress
 * @summary Creating a array of suggested addresses by using the first number of the `address.postal`
 * to grab a slice of faker created addresses. If the `address.postal` code starts with "9" we return an empty array.
 * @param {String} postalCode - address postal code.
 * @returns {Object[]} SuggestedAddresses - array of suggested addresses.
 */
function getSuggestedAddress(postalCode) {
  if (postalCode[0] === "9") return [];
  return fakeAddresses.slice(0, postalCode[0]);
}

/**
 *
 * @method getValidationErrors
 * @summary Creating a array of validation errors by using the second number of the `address.postal`
 * to grab a slice of mock validation errors. If the `address.postal` code starts with "9" we return an empty array.
 * @param {String} postalCode - address postal code.
 * @returns {Object[]} ValidationErrors - array of address validation errors.
 */
function getValidationErrors(postalCode) {
  if (postalCode[0] === "9") return [];
  return fakeValidationErrors.slice(0, postalCode[1]);
}

/**
 *
 * @method addressValidation
 * @summary Creating an `AddressValidationResults` object the `address.postal` to grab a slices of mock validation data.
 * @param {Object} input - Input object
 * @param {Object} input.address - input address object
 * @param {Object} input.context - input GQL context
 * @returns {Object} AddressValidationResults
 */
export default function addressValidation({ address: { postal } }) {
  return {
    suggestedAddresses: getSuggestedAddress(postal),
    validationErrors: getValidationErrors(postal)
  };
}

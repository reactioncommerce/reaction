import Reaction from "/imports/plugins/core/core/server/Reaction";
import addressValidation from "./server/addressValidation.js";

/**
 * @file Address Validation Test - This included example plugin serves
 * not only as a guide for registering a custom address validation plugin,
 * but also as a mock validation endpoint for building
 * custom address validation user interfaces.
 *
 * @namespace AddressValidationTest
 */

Reaction.registerPackage({
  label: "Address Validation Test",
  name: "address-validation-test",
  autoEnable: !!(process.env.NODE_ENV === "development"),
  addressValidationServices: [
    {
      displayName: "Test Validation",
      functions: {
        addressValidation
      },
      name: "test",
      supportedCountryCodes: ["US", "CA"]
    }
  ]
});

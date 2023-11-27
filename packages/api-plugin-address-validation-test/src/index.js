import pkg from "../package.json" assert { type: "json" };
import addressValidation from "./addressValidation.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Address Validation Test",
    name: "address-validation-test",
    version: pkg.version,
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
}

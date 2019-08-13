import addressValidation from "./addressValidation.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Address Validation Test",
    name: "address-validation-test",
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

import SimpleSchema from "simpl-schema";

const FulfillmentTypeDeclaration = new SimpleSchema({
  "registeredFulfillmentTypes": {
    type: Array
  },
  "registeredFulfillmentTypes.$": {
    type: String
  }
});

export const allRegisteredFulfillmentTypes = {
  registeredFulfillmentTypes: ["undecided"]
};

/**
 * @summary Collect all the registered Fulfillment types
 * @param {Object} registeredFulfillmentTypes - Fulfillment types passed in via child plugins
 * @returns {undefined} undefined
 */
export function registerPluginHandlerForFulfillmentTypes({ registeredFulfillmentTypes }) {
  if (registeredFulfillmentTypes) {
    allRegisteredFulfillmentTypes.registeredFulfillmentTypes = allRegisteredFulfillmentTypes.registeredFulfillmentTypes.concat(registeredFulfillmentTypes);
  }

  FulfillmentTypeDeclaration.validate(allRegisteredFulfillmentTypes);
}

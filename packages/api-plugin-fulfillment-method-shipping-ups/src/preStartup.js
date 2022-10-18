import { MethodUPSData } from "./simpleSchemas.js";

/**
 * @summary Called on preStartup to extend schemas
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodShippingUPSPreStartup(context) {
  const { simpleSchemas: { ShippingMethod, SelectedFulfillmentOption } } = context;

  ShippingMethod.extend({
    methodAdditionalData: {
      type: ShippingMethod.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodUPSData)
    }
  });

  SelectedFulfillmentOption.extend({
    methodAdditionalData: {
      type: SelectedFulfillmentOption.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodUPSData)
    }
  });
}

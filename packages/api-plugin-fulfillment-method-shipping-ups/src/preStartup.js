import { MethodDynamicRateData } from "./simpleSchemas.js";

/**
 * @summary Called on preStartup to extend schemas
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodShippingDynamicRatePreStartup(context) {
  const { simpleSchemas: { ShippingMethod, SelectedFulfillmentOption } } = context;

  ShippingMethod.extend({
    methodAdditionalData: {
      type: ShippingMethod.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodDynamicRateData)
    }
  });

  SelectedFulfillmentOption.extend({
    methodAdditionalData: {
      type: SelectedFulfillmentOption.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodDynamicRateData)
    }
  });
}

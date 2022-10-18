import { MethodFlatRateData } from "./simpleSchemas.js";
/**
 * @summary Called on preStartup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodShippingFlatRatePreStartup(context) {
  const { simpleSchemas: { ShippingMethod, SelectedFulfillmentOption } } = context;

  ShippingMethod.extend({
    methodAdditionalData: {
      type: ShippingMethod.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodFlatRateData)
    }
  });

  SelectedFulfillmentOption.extend({
    methodAdditionalData: {
      type: SelectedFulfillmentOption.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodFlatRateData)
    }
  });
}

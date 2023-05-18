import { MethodStoreData } from "./simpleSchemas.js";
/**
 * @summary Called on preStartup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentMethodPickupStorePreStartup(context) {
  const { simpleSchemas: { ShippingMethod, SelectedFulfillmentOption } } = context;

  ShippingMethod.extend({
    methodAdditionalData: {
      type: ShippingMethod.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodStoreData)
    }
  });

  SelectedFulfillmentOption.extend({
    methodAdditionalData: {
      type: SelectedFulfillmentOption.getDefinition(
        "methodAdditionalData",
        ["type"]
      ).type[0].type.extend(MethodStoreData)
    }
  });
}

/**
 * @summary Sample dummy function to simulate custom logic to retrieve additional data of the selected method
 * @param {Object} currentOrder - Current order which provide required details to perform rate calculation
 * @returns {Object} methodData - additional data
 */
function getDynamicRateData() {
  // currentOrder details could be passed in here and used as input to obtain any external data
  return {
    gqlType: "dynamicRateData",
    dynamicRateData: "This is additional STRING data from Shipping - DynamicRate"
  };
}
/**
 * @summary Sample dummy function to simulate custom logic to retrieve the rates of the selected method
 * @param {Object} method - current method for which rates are to be retrieved
 * @param {Object} currentOrder - Current order which provide required details to perform rate calculation
 * @returns {Object} updatedMethod - with the rate details populated
 */
export default function calculateDynamicRate(method, currentOrder) {
  // Collect order specific details for calculating the rates
  // const { items, shippingAddress } = currentOrder;

  // Make call to the external API of this Fulfillment method to collect the rates
  // Or we could have custom logic implemented here hat returns dynamic rate
  // Below we are just hardcoding with some dummy values
  const updatedMethod = method;
  updatedMethod.rate = 10;
  updatedMethod.handling = 20;
  updatedMethod.carrier = "DynamicRate";
  updatedMethod.methodAdditionalData = getDynamicRateData(currentOrder);

  return updatedMethod;
}

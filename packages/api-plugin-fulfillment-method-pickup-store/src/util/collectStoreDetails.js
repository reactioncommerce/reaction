/**
 * @summary Sample dummy function returning store details
 * @param {Object} customerAddress - Address of the customer to find nearest store
 * @param {Object} [items] - List of items to verify the stock availability
 * @returns {Object} [storesArray] - list of available stores
 */
function getStoresArray() {
  // Custom logic to find out the list of stores that has the mentioned items in stock
  // customerAddress could be used in here and used to figure out the nearest store for listing the results
  // items details could be used to verify the availability of the particular item in a store

  return {
    gqlType: "storeData",
    storeData: [
      {
        storeId: "Store-1",
        storeAddress: "123, 5th Main, Some place",
        storeTiming: "7am to 9pm"
      },
      {
        storeId: "Store-2",
        storeAddress: "456, 50th Main, Some other place",
        storeTiming: "7am to 9pm"
      }
    ]
  };
}

/**
 * @summary Sample dummy function to simulate custom logic to retrieve the rates of the selected method
 * @param {Object} method - current method for which rates are to be retrieved
 * @param {Object} currentOrder - Current order which provide required details to perform rate calculation
 * @returns {Object} updatedMethod - with the rate details populated
 */
export default function collectStoreDetails(method, currentOrder) {
  // Calculation of the returned rate could be dependent on currentOrder or
  const { items, shippingAddress } = currentOrder;

  // Make call to the Fulfillment method API and collect the rates
  // Below we are just hardcoding with some dummy values
  const updatedMethod = method;
  updatedMethod.rate = 5;
  updatedMethod.handling = 10;
  updatedMethod.carrier = "Store";
  updatedMethod.methodAdditionalData = getStoresArray(shippingAddress, items);

  return updatedMethod;
}

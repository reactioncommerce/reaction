import { operators, propertyTypes } from "./helpers";

/**
 * @summary Filter shipping methods based on per method attribute restrictions
 * @param {Object} methods - all available shipping methods to check
 * @param {Object} hydratedCart - hydrated cart for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export async function attributeDenyCheck(flatRateFulfillmentRestrictionsCollection, methods, hydratedCart) {
  return methods.reduce(async (validShippingMethods, method) => {
    const awaitedValidShippingMethods = await validShippingMethods;
    const { items } = hydratedCart;

    // Get method specific allow restrictions
    const methodRestrictions = await flatRateFulfillmentRestrictionsCollection.find({ methodIds: method._id, type: "deny" }).toArray();

    // Check to see if any restrictions for this method are destination restrictions
    const attributeRestrictions = methodRestrictions.some((restriction) => restriction.attributes && restriction.attributes.length);

    console.log("attributeRestriction", attributeRestrictions);


    // If there are no destination allow restrictions, this method is valid at this point
    if (!attributeRestrictions) {
      awaitedValidShippingMethods.push(method);
      return awaitedValidShippingMethods;
    }

    console.log("------------------------ methodRestrictions", methodRestrictions);


    // items.reduce((itemCheck, item) => {
    //   // If any item matches a restriction, restrict method
    //   const foundRestrictedProperty = attributes.some((attribute) => { // eslint-disable-line
    //     return operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));
    //   });


    //   if (!foundRestrictedProperty) {
    //     awaitedValidShippingMethods.push(method);
    //   }

    //   return awaitedValidShippingMethods;
    // }, []);

    return awaitedValidShippingMethods;
  }, Promise.resolve([]));
}

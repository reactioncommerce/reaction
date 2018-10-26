import { operators, propertyTypes } from "./helpers";


/**
 * @summary Filter shipping methods based on global restrictions
 * @param {Object} globalShippingRestrictions - provided global restriction settings
 * @param {Object} shippingAttributes - computed shippingAttributes for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function globalDenyCheck(shippingAttributes) {

  // This should be passed in once we find out where to store it
  const globalShippingRestrictions = {
    "allow" : {},
    "deny": {
      "attributes": [
        {
          "property" : "productVendor",
          "value" : "Erik",
          "propertyType" : "string",
          "operator" : "eq",
          "destination": {
            "region": [
              "NY"
            ]
          }
        }
      ]
    }
  }

  const { items } = shippingAttributes;
  const { deny: { attributes }} = globalShippingRestrictions;

    // console.log("-------------------- globalRestrictions list, this should return either all methods or no methods --------------------");


    // If there are no global restrictions, then stop global check and move on
    // to method specific checks
    if (!attributes || !Array.isArray(attributes) || !attributes.length) {
      // console.log("-------------------- there are no global restrictions, allow method restrictions tests -------------------");
      return true;
    }


    const doItemsContainGlobalRestrictions = items.some((item) => {
      // If any item matches a restriction, restrict method
      return foundRestrictedProperty = attributes.some((attribute) => {

        const attributeFound = operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));

        if (attributeFound) {

          // console.log("----------------------------item", item);
          // console.log("----------------------------attribute", attribute);
//check if destination
          // operators[attribute.operator](item[attribute.destination], propertyTypes[attribute.propertyType](attribute.value))
          const restrictionDestination = attribute.destination;

          if (!restrictionDestination) return attributeFound; // this will be true

          const { country: restrictionCountry, postal: restrictionPostal, region: restrictionRegion } = restrictionDestination;
          // console.log("-------- restrictionDestination", restrictionDestination);


          if (restrictionPostal && restrictionPostal.includes(shippingAttributes.address.postal)) {
            return true;
          }

          // Check for an allow list of regions
          if (restrictionRegion && restrictionRegion.includes(shippingAttributes.address.region)) {
            return true;
          }

          // Check for an allow list of countries
          if (restrictionCountry && restrictionCountry.includes(shippingAttributes.address.country)) {
            return true;
          }

        }

      });

      // console.log("foundRestrictedProperty---------------------------------", foundRestrictedProperty);


    })

    // Return the opposite
    // If restrictions are found, return false, meaning  we deny
    // If they aren't found, return true, meaning we keep moving on
    return !doItemsContainGlobalRestrictions;
}


/**
 * @summary Filter shipping methods based on per method attribute restrictions
 * @param {Object} availableShippingRates - all available shipping rates to check
 * @param {Object} shippingAttributes - computed shippingAttributes for current order
 * @returns {Object|null} available shipping methods after filtering
 */
function attributeDenyCheck(availableShippingRates, shippingAttributes) {
  return availableShippingRates.reduce((validShippingRates, rate) => {
    const { items } = shippingAttributes;
    const { method: { restrictions: { deny: { attributes }}}} = rate;

    // console.log("-------------------- made it past location deny List check, checking for attribute deny list check now--------------------", rate.method.name);


    // If there are not attribute restrtions, then method is unrestricted
    if (!attributes || !Array.isArray(attributes) || !attributes.length) {
      validShippingRates.push(rate);
      return validShippingRates;
    }


    items.reduce((itemCheck, item) => {
      // If any item matches a restriction, restrict method
      const foundRestrictedProperty = attributes.some((attribute) => {

        // If a propertyType is not present, or does not match a predefined `propertyTypes`
        // return true and make method restricted
        // if (!attributes.propertyType || !Object.keys(propertyTypes).includes(attributes.propertyType)) {
        //   return true;
        // }

        return operators[attribute.operator](item[attribute.property], propertyTypes[attribute.propertyType](attribute.value));
      });


      if (!foundRestrictedProperty) {
        validShippingRates.push(rate);
      }

      return validShippingRates;
    }, [])


    return validShippingRates;
  }, [])
}



















/**
 * @summary Filter shipping methods based on per method restrictions
 * @param {Object} rates - all available shipping rates for a shop
 * @param {Object} shippingAttributes - computed shippingAttributes for current order
 * @returns {Object|null} available shipping methods after filtering
 */
export default function filterShippingAttributes(context, rates, shippingAttributes) {
  const { collections } = context; // TODO: pull collections from context
  // console.log("-------------------- shippingAttributes for current order ----------------------------------------", shippingAttributes); // TODO: remove log, for testing only

  // Check global restrictions list, and return no methods if any global restriction applies
  const isShippingAllowed = globalDenyCheck(shippingAttributes);
  if (!isShippingAllowed) return [];

  // console.log("-------------------- isShippingAllowed --------------------", isShippingAllowed);


  const allowedMethodsBasedOnShippingLocationsAllowList = rates.reduce((validShippingRates, rate) => {
    // Return nothing if there is no method on the rate
    if (!rate && rate.method) return validShippingRates;

    const { method: { restrictions } } = rate;

    // console.log("-------------------- first check, all (10) methods should produce this log --------------------", rate.method.name);

    // If method has no restrictions, add rate to validShippingRates
    if (!restrictions) {
      validShippingRates.push(rate);
      return validShippingRates;
    }


    // If rate does have allow list, check for further filtration
    if (restrictions && restrictions.allow) {
      const { allow: { destination } } = restrictions;

      // If there is no allow.destination list, add rate to validShippingRates
      // We don't have an allow.attributes list
      if (!destination) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // Start checking at the micro-level, and move more macro as we go on

      // Check for an allow list of postal codes
      if (destination.postal && destination.postal.includes(shippingAttributes.address.postal)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // Check for an allow list of regions
      if (destination.region && destination.region.includes(shippingAttributes.address.region)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }

      // Check for an allow list of countries
      if (destination.country && destination.country.includes(shippingAttributes.address.country)) {
        validShippingRates.push(rate);
        return validShippingRates;
      }
    }

    // Return validShippingRates reduced array
    return validShippingRates;
  }, []);








  // Run remaining available rates through the deny
  const allowedMethodsBasedOnShippingLocationsDenyList = allowedMethodsBasedOnShippingLocationsAllowList.reduce((validShippingRates, rate) => {
  // const availableShippingRates = allowedMethodsBasedOnShippingLocationsAllowList.reduce((validShippingRates, rate) => {

    const { method: { restrictions } } = rate;

    // console.log("-------------------- made it past location allow List check, checking for deny list check now --------------------", rate.method.name);

    // If rate does not have deny restrictions, add it to the available rates
    if (restrictions && !restrictions.deny) {
      validShippingRates.push(rate);
      return validShippingRates;
    }

    // There is a deny object on the shipping method (there always should be)
    // Check to see if anything matches

    const { deny: { destination }, allow: { destination: allowDestination } } = restrictions;

    // If country deny exists, use this
    if (destination && destination.country && destination.country.includes(shippingAttributes.address.country)) {
      return validShippingRates;
    }

    // If region deny exists, use this if there is no country deny
    if (destination && destination.region && destination.region.includes(shippingAttributes.address.region)) {
      return validShippingRates;
    }

    // If postal code deny exists, use this if there is no country or region deny
    if (destination && destination.postal && destination.postal.includes(shippingAttributes.address.postal)) {
      return validShippingRates;
    }

    // If it passes all the deny restrictions, add add it to the list of available rates
    validShippingRates.push(rate);
    return validShippingRates;
  }, []);


  // Run remaining shipping rates list through attribute deny check
  const reducedShippingRates = attributeDenyCheck(allowedMethodsBasedOnShippingLocationsDenyList, shippingAttributes);

  // console.log("-------------------- reducedShippingRates --------------------", reducedShippingRates); // TODO: remove log, for testing only

  // Return all remaining availalbe shipping rates
  return reducedShippingRates;
}

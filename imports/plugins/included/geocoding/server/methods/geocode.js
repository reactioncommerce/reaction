import NodeGeocoder from "node-geocoder";
import { Meteor } from "meteor/meteor";

const options = {
  provider: "google"
};

const Geocoder = NodeGeocoder(options);

const geocoder = {};

/**
 * @summary Return a verified address from Google
 * @param {Object} address - Address to verify
 * @returns {Object} Verified address or empty array
 */
geocoder.geocode = function (address) {
  // check(address, Schemas.Address);

  const street = `${address.address1} ${address.address2}`;
  const advancedAddress = {
    address: street,
    country: address.country,
    zipcode: address.postal
  };

  const wrappedFunction = Meteor.wrapAsync(Geocoder.geocode, Geocoder);
  const result = wrappedFunction(advancedAddress);
  const addressResult = result[0];
  const verifiedAddress = {
    address1: address.address1,
    address2: address.address2,
    city: addressResult.city,
    country: addressResult.countryCode,
    postal: addressResult.zipcode
  };
  return verifiedAddress;
};

export default geocoder;

Meteor.methods({
  "reaction/geocoder/geocode": geocoder.geocode
});

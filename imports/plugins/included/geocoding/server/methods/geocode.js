import NodeGeocoder from "node-geocoder";


const options = {
  provider: "google"
};

const Geocoder = NodeGeocoder(options);

const geocoder = {};

/**
 * @summary Return a verified address from Google
 * @param {Object} address - Address to verify
 * @param {Function} callback - Callback function
 * @returns {Object} Verified address or empty array
 */
geocoder.geocode = function (address, callback) {
  // check(address, Schemas.Address);

  const street = `${address.address1} ${address.address2}`;
  const advancedAddress = {
    address: street,
    country: address.country,
    zipcode: address.postal
  };

  Geocoder.geocode(advancedAddress, function (error, result) {
    if (!error) {
      const addressResult = result[0];
      const verifiedAddress = {
        address1: address.address1,
        address2: address.address2,
        city: addressResult.city,
        country: addressResult.countryCode,
        postal: addressResult.zipcode
      };

      return callback(error, verifiedAddress);
    }
    throw new Meteor.Error("Error while trying to Geocode address");
  });
};

export default geocoder;

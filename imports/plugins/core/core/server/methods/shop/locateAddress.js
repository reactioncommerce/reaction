import { check, Match } from "meteor/check";
import GeoCoder from "../../util/geocoder";

/**
 * @name shop/locateAddress
 * @method
 * @memberof Shop/Methods
 * @summary determine user's full location for autopopulating addresses
 * @param {Number} latitude - latitude
 * @param {Number} longitude - longitude
 * @returns {Object} returns address
 */
export default function locateAddress(latitude, longitude) {
  check(latitude, Match.Optional(Number));
  check(longitude, Match.Optional(Number));
  let clientAddress;
  this.unblock();

  // if called from server, ip won't be defined.
  if (this.connection !== null) {
    ({ clientAddress } = this.connection);
  } else {
    clientAddress = "127.0.0.1";
  }

  // begin actual address lookups
  if (latitude !== null && longitude !== null) {
    const geo = new GeoCoder();
    return geo.reverse(latitude, longitude);
  }

  // geocode reverse ip lookup
  const geo = new GeoCoder();
  return geo.geoip(clientAddress);
}

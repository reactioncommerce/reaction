import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { HTTP } from "meteor/http";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * meteor-geocoder
 * modifed for reaction core.
 *
 * https://github.com/aldeed/meteor-geocoder
 * The MIT License (MIT)
 * Copyright (c) 2014 Eric Dobbertin
 * @ignore
 * @param {Object} options to pass
 * @returns {undefined}
 */
function GeoCoder(options) {
  let extra;
  const self = this;
  // fetch shop settings for api auth credentials
  const shopSettings = Packages.findOne({
    shopId: Reaction.getShopId(),
    name: "core"
  }, {
    fields: {
      settings: 1
    }
  });

  if (shopSettings) {
    if (shopSettings.settings.google) {
      extra = {
        clientId: shopSettings.settings.google.clientId,
        apiKey: shopSettings.settings.google.apiKey
      };
    }
  }

  self.options = _.extend({
    geocoderProvider: "google",
    httpAdapter: "https",
    extra
  }, options || {});
}

/**
 * @param {String} address ip address
 * @param {Object} options options to pass
 * @param {Function} callback callback
 * @returns {undefined}
 */
function gc(address, options, callback) {
  const geocoder = require("node-geocoder")(
    options.geocoderProvider, options.httpAdapter,
    options.extra
  );
  geocoder.geocode(address, callback);
}

GeoCoder.prototype.geocode = function geoCoderGeocode(address, callback) {
  let geoCallback = callback;
  let geoAddress = address;
  if (geoCallback) {
    geoCallback = Meteor.bindEnvironment(geoCallback, (error) => {
      if (error) throw error;
    });
    gc(geoAddress, this.options, geoCallback);
  } else {
    geoAddress = Meteor.wrapAsync(gc)(geoAddress, this.options);
    return geoAddress[0];
  }

  return null;
};

/**
 * @param {String} lat latitude
 * @param {String} lng longitude
 * @param {Object} options geocoder options
 * @param {Function} callback callback
 * @returns {undefined}
 */
function rv(lat, lng, options, callback) {
  const geocoder = require("node-geocoder")(
    options.geocoderProvider, options.httpAdapter,
    options.extra
  );
  geocoder.reverse({
    lat,
    lon: lng
  }, callback);
}

GeoCoder.prototype.reverse = function geoCoderReverse(lat, lng, callback) {
  let geoCallback = callback;
  if (geoCallback) {
    geoCallback = Meteor.bindEnvironment(geoCallback, (error) => {
      if (error) throw error;
    });
    return rv(lat, lng, this.options, geoCallback);
  }
  try {
    const address = Meteor.wrapAsync(rv)(lat, lng, this.options);
    return address[0];
  } catch (_error) {
    return {
      latitude: null,
      longitude: null,
      country: "United States",
      city: null,
      state: null,
      stateCode: null,
      zipcode: null,
      streetName: null,
      streetNumber: null,
      countryCode: "US"
    };
  }
};

/**
 * @param {String} address ip address
 * @param {Function} callback callback
 * @returns {undefined}
 */
function gi(address, callback) {
  let lookupAddress = address;
  // short term solution to an haproxy ssl cert installation issue
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // if we're local, let's let freegeoip guess.
  if (lookupAddress === "127.0.0.1" || lookupAddress === null) {
    lookupAddress = "";
  }
  // calls a private reaction hosted version of freegeoip
  HTTP.call("GET", `https://geo.getreaction.io/json/${lookupAddress}`, callback);
}

GeoCoder.prototype.geoip = function geoCoderGeocode(address, callback) {
  let geoCallback = callback;
  let geoAddress = address;
  if (geoCallback) {
    geoCallback = Meteor.bindEnvironment(geoCallback, (error) => {
      if (error) throw error;
    });
    return gi(geoAddress, this.options, geoCallback);
  }
  try {
    geoAddress = Meteor.wrapAsync(gi)(geoAddress);
    return geoAddress.data;
  } catch (error) {
    Logger.warn("shop/getLocale geoip lookup failure", error);
    return {};
  }
};

export default GeoCoder;

/**
 * meteor-geocoder
 * modifed for reaction core.
 *
 * https://github.com/aldeed/meteor-geocoder
 * The MIT License (MIT)
 * Copyright (c) 2014 Eric Dobbertin
 */

// backwards compatibility
if (typeof Meteor.wrapAsync === "undefined") {
  Meteor.wrapAsync = Meteor._wrapAsync;
}

// init geocoder
GeoCoder = function geoCoderConstructor(options) {
  // fetch shop settings for api auth credentials
  var shopSettings = ReactionCore.Collections.Packages.findOne({
    shopId: ReactionCore.getShopId(),
    name: "core"
  }, {
    fields: {
      settings: 1
    }
  });

  if (shopSettings) {
    if (shopSettings.settings.google) {
      var extra = {
        clientId: shopSettings.settings.google.clientId,
        apiKey: shopSettings.settings.google.apiKey
      };
    }
  }

  var self = this;
  self.options = _.extend({
    geocoderProvider: 'google',
    httpAdapter: 'https',
    extra: extra
  }, options || {});
};

var gc = function (address, options, callback) {
  var g = Npm.require('node-geocoder')(options.geocoderProvider, options.httpAdapter, options.extra);
  g.geocode(address, callback);
};

GeoCoder.prototype.geocode = function geoCoderGeocode(address, callback) {
  if (callback) {
    callback = Meteor.bindEnvironment(callback, function (error) {
      if (error) throw error;
    });
    gc(address, this.options, callback);
  } else {
    address = Meteor.wrapAsync(gc)(address, this.options)
    return address[0];
  }
};

var rv = function (lat, lng, options, callback) {
  var g = Npm.require('node-geocoder')(options.geocoderProvider, options.httpAdapter, options.extra);
  g.reverse({
    lat: lat,
    lon: lng
  }, callback);
};

GeoCoder.prototype.reverse = function geoCoderReverse(lat, lng, callback) {
  if (callback) {
    callback = Meteor.bindEnvironment(callback, function (error) {
      if (error) throw error;
    });
    rv(lat, lng, this.options, callback);
  } else {
    try {
      address = Meteor.wrapAsync(rv)(lat, lng, this.options);
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
  }
};


var gi = function (address, options, callback) {
  // short term solution to an haproxy ssl cert installation issue
  process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
  // calls a private reaction hosted version of freegeoip
  HTTP.call( "GET", "https://geo.getreaction.io/json/" + address, callback);
};

GeoCoder.prototype.geoip = function geoCoderGeocode(address, callback) {
  if (callback) {
    callback = Meteor.bindEnvironment(callback, function (error) {
      if (error) throw error;
    });
    gi(address, this.options, callback);
  } else {
    address = Meteor.wrapAsync(gi)(address, this.options)
    return address.data;
  }
};

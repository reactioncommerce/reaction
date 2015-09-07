/**
 * node-geocoder
 * configure node-geocoder
 */

var Packages;
var geocoderProvider = 'freegeoip';
var httpAdapter = 'https';
var GeoCoder = Npm.require('node-geocoder')(geocoderProvider, httpAdapter);

Packages = ReactionCore.Collections.Packages;

/**
 * Reaction Shop Methods
 */

Meteor.methods({

  /*
   *
   * createShop
   * param String 'userId' optionally create shop for provided userId
   * param Object 'shop' optionally provide shop object to customize
   *
   */
  createShop: function (userId, shop) {
    var adminRoles, currentUser, e, shopId;
    check(userId, Match.Optional(String));
    check(shop, Match.Optional(Object));
    currentUser = Meteor.userId();
    userId = userId || Meteor.userId();
    if (!ReactionCore.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    adminRoles = Roles.getRolesForUser(currentUser, ReactionCore.getShopId());
    shopId = Factory.create("shop")._id;
    try {
      ReactionCore.Events.warn("Created shop: ", shopId);
      Roles.addUsersToRoles([currentUser, userId], adminRoles, shopId);
      return shopId;
    } catch (_error) {
      e = _error;
      return ReactionCore.Events.warn("Failed to createShop", e);
    }
  },

  /**
   * getLocale
   * determine user's countryCode and return locale object
   * determine local currency and conversion rate from shop currency
   * @return  {Object}
   */
  getLocale: function () {
    this.unblock();
    var countryCode, geoCountryCode, currency, exchangeRate, localeCurrency, rateUrl, _i, _len;
    var clientAddress = this.connection.clientAddress;
    var result = {};

    var shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: ReactionCore.getShopId(),
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });

    console.log(shopSettings);

    // shouldn't be here before a shop!
    if (!shop) {
      return result;
    }

    // cofigure default defaultCountryCode
    // fallback to shop settings
    if (shop.addressBook.length >= 1) {
      defaultCountryCode = shop.addressBook[0].country;
    } else {
      defaultCountryCode = 'US';
    }

    // geocode reverse ip lookup
    GeoCoder.geocode(clientAddress, function (err, geo) {
      if (geo) {
        geoCountryCode = geo.countryCode;
      }
    });

    // countryCode either from geo or defaults
    countryCode = (geoCountryCode || defaultCountryCode).toUpperCase();

    // get currency rates
    result.currency = {};
    result.locale = shop.locales.countries[countryCode];
    localeCurrency = shop.locales.countries[countryCode].currency.split(',');

    // localeCurrency is an array of allowed currencies
    _.each(localeCurrency, function (currency) {
      if (shop.currencies[currency]) {
        result.currency = shop.currencies[currency];
        // only fetch rates if current user currency
        // from locale and shop currency arent the same
        if (shop.currency == currency) {
          rateUrl = "https://openexchangerates.org/api/convert/1/" + shop.currency + "/" + currency + "?app_id=" + "c102629388344603bd34c150a66291aa";
          ReactionCore.Events.info("Fetching exchange rates from: ", rateUrl);
          exchangeRate = HTTP.get(rateUrl);

          if (!exchangeRate) {
            ReactionCore.Events.warn("Failed to fetch rate exchange rates.");
          }
          result.currency.exchangeRate = exchangeRate.data;
        }
      }
    });
    return result;
  },

  /**
   * determine user's full location for autopopulating addresses
   */
  locateAddress: function (latitude, longitude) {
    check(latitude, Match.Optional(Number));
    check(longitude, Match.Optional(Number));
    this.unblock();

    var address, error, geo, ip;

    try {
      if ((latitude != null) && (longitude != null)) {
        geo = new GeoCoder();
        address = GeoCoder.reverse(latitude, longitude);
      } else {
        ip = this.connection.httpHeaders['x-forwarded-for'];
        if (ip) {
          geo = new GeoCoder({
            geocoderProvider: "freegeoip"
          });
          address = geo.geocode(ip);
        }
      }
    } catch (_error) {
      error = _error;
      if ((latitude != null) && (longitude != null)) {
        ReactionCore.Events.info("Error in locateAddress for latitude/longitude lookup (" + latitude + "," + longitude + "):" + error.message);
      } else {
        ReactionCore.Events.info("Error in locateAddress for IP lookup (" + ip + "):" + error.message);
      }
    }

    if (address != null ? address.length : void 0) {
      return address[0];
    } else {
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
  },

  /**
   * method to insert or update tag with hierarchy
   * tagName will insert
   * tagName + tagId will update existing
   * currentTagId will update related/hierarchy
   */
  updateHeaderTags: function (tagName, tagId, currentTagId) {
    console.log("updateHeaderTags")
    var existingTag, newTag, newTagId;
    check(tagName, String);
    check(tagId, Match.OneOf(String, null, void 0));
    check(currentTagId, Match.Optional(String));
    if (!ReactionCore.hasPermission('core')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    newTag = {
      slug: getSlug(tagName),
      name: tagName
    };
    existingTag = Tags.findOne({
      "name": tagName
    });
    if (tagId) {
      return Tags.update(tagId, {
        $set: newTag
      }, function () {
        ReactionCore.Events.info("Changed name of tag " + tagId + " to " + tagName);
        return true;
      });
    } else if (existingTag) {
      if (currentTagId) {
        return Tags.update(currentTagId, {
          $addToSet: {
            "relatedTagIds": existingTag._id
          }
        }, function () {
          ReactionCore.Events.info('Added tag "' + existingTag.name + '" to the related tags list for tag ' + currentTagId);
          return true;
        });
      } else {
        return Tags.update(existingTag._id, {
          $set: {
            "isTopLevel": true
          }
        }, function () {
          ReactionCore.Events.info('Marked tag "' + existingTag.name + '" as a top level tag');
          return true;
        });
      }
    } else {
      newTag.isTopLevel = !currentTagId;
      newTag.shopId = ReactionCore.getShopId();
      newTag.updatedAt = new Date();
      newTag.createdAt = new Date();
      newTagId = Tags.insert(newTag);
      if (currentTagId) {
        return Tags.update(currentTagId, {
          $addToSet: {
            "relatedTagIds": newTagId
          }
        }, function () {
          ReactionCore.Events.info('Added tag "' + newTag.name + '" to the related tags list for tag ' + currentTagId);
          return true;
        });
      } else if (newTagId && !currentTagId) {
        ReactionCore.Events.info('Created tag "' + newTag.name + '"');
        return true;
      } else {
        throw new Meteor.Error(403, "Failed to update header tags.");
      }
    }
  },
  removeHeaderTag: function (tagId, currentTagId) {
    var productCount, relatedTagsCount;
    check(tagId, String);
    check(currentTagId, String);
    if (!ReactionCore.hasPermission('core')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    Tags.update(currentTagId, {
      $pull: {
        "relatedTagIds": tagId
      }
    });
    productCount = Products.find({
      "hashtags": {
        $in: [tagId]
      }
    }).count();
    relatedTagsCount = Tags.find({
      "relatedTagIds": {
        $in: [tagId]
      }
    }).count();
    if ((productCount === 0) && (relatedTagsCount === 0)) {
      return Tags.remove(tagId);
    } else {
      throw new Meteor.Error(403, "Unable to delete tags that are in use.");
    }
  },

  /**
   * Helper method to remove all translations, and reload from jsonFiles
   */
  flushTranslations: function () {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    ReactionCore.Collections.Translations.remove({});
    Fixtures.loadI18n();
    return ReactionCore.Events.info(Meteor.userId() + " Flushed Translations.");
  },

  /**
   * "shop/getWorkflow"
   * returns workflow array
   */

  'shop/getWorkflow': function (name) {
    check(name, String);

    shopWorkflows = ReactionCore.Collections.Shops.findOne({
      defaultWorkflows: {
        $elemMatch: {
          provides: name
        }
      }
    }, {
      fields: {
        defaultWorkflows: true
      }
    });
    return shopWorkflows;
  }
});

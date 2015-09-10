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
    var result = {};

    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      var clientAddress = this.connection.clientAddress
    } else {
      var clientAddress = "127.0.0.1";
    }
    // get shop locale/currency related data
    var shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    // cofigure default defaultCountryCode
    // fallback to shop settings
    if (shop.addressBook.length >= 1) {
      defaultCountryCode = shop.addressBook[0].country;
    } else {
      defaultCountryCode = 'US';
    }

    // geocode reverse ip lookup
    var geo = new GeoCoder();
    geoCountryCode = geo.geoip(clientAddress).countryCode;

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
        // only fetch rates if locale and shop currency are not equal
        // if shop.curency = locale currency the rate is 1
        if (shop.currency !== currency) {
          result.currency.exchangeRate = Meteor.call("getCurrencyRates", currency);

          if (!exchangeRate) {
            ReactionCore.Events.warn("Failed to fetch rate exchange rates.");
          }
          result.currency.exchangeRate = exchangeRate.data;
        }
      }
    });

    // should contain rates, locale, currency
    return result;
  },

  /**
   * getCurrencyRates
   * determine user's full location for autopopulating addresses
   * usage: Meteor.call("getCurrencyRates","USD")
   * @param String currency code
   * @return Number currency conversion rate
   */
  getCurrencyRates: function (currency) {
    check(currency, String);
    this.unblock();

    var shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });
    var baseCurrency = shop.currency || "USD";
    var shopCurrencies = shop.currencies;
    var shopId = ReactionCore.getShopId();

    // fetch shop settings for api auth credentials
    var shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: shopId,
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });

    // shop open exchange rates appId
    var openexchangeratesAppId = shopSettings.settings.openexchangerates.appId;

    // update Shops.currencies[currencyKey].rate
    // with current rates from Open Exchange Rates
    // warn if we don't have app_id, but default to 1
    if (!openexchangeratesAppId) {
      ReactionCore.Events.warn("Open Exchange Rates AppId not configured. Configure for current rates.");
    } else {
      // we'll update all the available rates in Shops.currencies whenever we get a rate request, using base currency
      var rateUrl = "https://openexchangerates.org/api/latest.json?base=" + baseCurrency + "&app_id=" + openexchangeratesAppId;
      var rateResults = HTTP.get(rateUrl);
      var exchangeRates = rateResults.data.rates;

      _.each(shopCurrencies, function (currencyConfig, currencyKey) {

        if (exchangeRates[currencyKey] !== undefined) {
          var rateUpdate = {};
          var collectionKey = 'currencies.' + currencyKey + '.rate';
          rateUpdate[collectionKey] = exchangeRates[currencyKey];
          ReactionCore.Collections.Shops.update(shopId, {
            $set: rateUpdate
          });
        }
      });
      // return just the rate requested.
      return exchangeRates[currency];
    }
    // default conversion rate 1 to 1
    return 1;
  },

  /**
   * locateAddress
   * determine user's full location for autopopulating addresses
   */
  locateAddress: function (latitude, longitude) {
    check(latitude, Match.Optional(Number));
    check(longitude, Match.Optional(Number));
    this.unblock();

    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      var clientAddress = this.connection.clientAddress
    } else {
      var clientAddress = "127.0.0.1";
    }

    // begin actual address lookups
    if ((latitude != null) && (longitude != null)) {
      var geo = new GeoCoder();
      return geo.reverse(latitude, longitude);
    } else {
      // geocode reverse ip lookup
      var geo = new GeoCoder();
      return geo.geoip(clientAddress);
    }
  },

  /**
   * updateHeaderTags
   * method to insert or update tag with hierarchy
   * tagName will insert
   * tagName + tagId will update existing
   * currentTagId will update related/hierarchy
   */
  updateHeaderTags: function (tagName, tagId, currentTagId) {
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

  /**
   * removeHeaderTag
   * method to remove tag navigation tags
   */
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
   * flushTranslations
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

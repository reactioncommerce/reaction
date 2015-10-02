/**
 * Reaction Shop Methods
 */
Meteor.methods({
  /**
   * shop/createShop
   * @param {String} shopAdminUserId - optionally create shop for provided userId
   * @param {Object} shop - optionally provide shop object to customize
   * @return {String} return shopId
   */
  "shop/createShop": function (shopAdminUserId, shop) {
    check(shopAdminUserId, Match.Optional(String));
    check(shop, Match.Optional(Object));

    // must have owner access to create new shops
    if (!ReactionCore.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access Denied. Owner Access Required");
    }

    this.unblock();

    let currentUser = Meteor.userId();
    let userId = shopAdminUserId || Meteor.userId();
    let adminRoles = Roles.getRolesForUser(currentUser, ReactionCore.getShopId());

    try {
      let shopId = Factory.create("shop")._id;
      ReactionCore.Log.info("Created shop: ", shopId);
      Roles.addUsersToRoles([currentUser, userId], adminRoles, shopId);
      return shopId;
    } catch (error) {
      return ReactionCore.Log.error("Failed to shop/createShop", error);
    }
  },

  /**
   * shop/getLocale
   * @summary determine user's countryCode and return locale object
   * determine local currency and conversion rate from shop currency
   * @return {Object} returns user location and locale
   */
  "shop/getLocale": function () {
    this.unblock();
    let exchangeRate;
    let localeCurrency;
    let clientAddress;
    let geo = new GeoCoder();
    let result = {};
    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      clientAddress = this.connection.clientAddress;
    } else {
      clientAddress = "127.0.0.1";
    }

    // get shop locale/currency related data
    let shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    if (!shop) {
      throw new Meteor.Error(
        "Failed to find shop data. Unable to determine locale.");
    }
    // cofigure default defaultCountryCode
    // fallback to shop settings
    if (shop.addressBook) {
      if (shop.addressBook.length >= 1) {
        defaultCountryCode = shop.addressBook[0].country;
      } else {
        defaultCountryCode = "US";
      }
    } else {
      defaultCountryCode = "US";
    }

    // geocode reverse ip lookup
    let geoCountryCode = geo.geoip(clientAddress).countryCode;
    // countryCode either from geo or defaults
    let countryCode = (geoCountryCode || defaultCountryCode).toUpperCase();

    // get currency rates
    result.currency = {};
    result.locale = shop.locales.countries[countryCode];
    // ensure default currency
    if (result.locale) {
      localeCurrency = shop.locales.countries[countryCode].currency.split(
        ",");
    } else {
      localeCurrency = "USD";
    }

    // localeCurrency is an array of allowed currencies
    _.each(localeCurrency, function (currency) {
      if (shop.currencies[currency]) {
        result.currency = shop.currencies[currency];
        // only fetch rates if locale and shop currency are not equal
        // if shop.curency = locale currency the rate is 1
        if (shop.currency !== currency) {
          result.currency.exchangeRate = Meteor.call(
            "shop/getCurrencyRates", currency);

          if (!exchangeRate) {
            ReactionCore.Log.warn(
              "Failed to fetch rate exchange rates.");
          }
          result.currency.exchangeRate = exchangeRate.data;
        }
      }
    });
    // should contain rates, locale, currency
    return result;
  },

  /**
   * shop/getCurrencyRates
   * @summary determine user's full location for autopopulating addresses
   * usage: Meteor.call("shop/getCurrencyRates","USD")
   * @param {String} currency code
   * @return {Number} currency conversion rate
   */
  "shop/getCurrencyRates": function (currency) {
    check(currency, String);
    this.unblock();

    let shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    let baseCurrency = shop.currency || "USD";
    let shopCurrencies = shop.currencies;
    let shopId = ReactionCore.getShopId();

    // fetch shop settings for api auth credentials
    let shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: shopId,
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });

    // shop open exchange rates appId
    let openexchangeratesAppId = shopSettings.settings.openexchangerates.appId;

    // update Shops.currencies[currencyKey].rate
    // with current rates from Open Exchange Rates
    // warn if we don't have app_id, but default to 1
    if (!openexchangeratesAppId) {
      ReactionCore.Log.warn(
        "Open Exchange Rates AppId not configured. Configure for current rates."
      );
    } else {
      // we'll update all the available rates in Shops.currencies whenever we get a rate request, using base currency
      let rateUrl =
        `https://openexchangerates.org/api/latest.json?base=${baseCurrency}&app_id=${openexchangeratesAppId}`;
      let rateResults = HTTP.get(rateUrl);
      let exchangeRates = rateResults.data.rates;

      _.each(shopCurrencies, function (currencyConfig, currencyKey) {
        if (exchangeRates[currencyKey] !== undefined) {
          let rateUpdate = {};
          let collectionKey = `currencies.${currencyKey}.rate`;
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
   * shop/locateAddress
   * @summary determine user's full location for autopopulating addresses
   * @param {Number} latitude - latitude
   * @param {Number} longitude - longitude
   * @return {Object} returns address
   */
  "shop/locateAddress": function (latitude, longitude) {
    check(latitude, Match.Optional(Number));
    check(longitude, Match.Optional(Number));
    let clientAddress;
    this.unblock();

    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      clientAddress = this.connection.clientAddress;
    } else {
      clientAddress = "127.0.0.1";
    }

    // begin actual address lookups
    if (latitude !== null && longitude !== null) {
      let geo = new GeoCoder();
      return geo.reverse(latitude, longitude);
    }
    // geocode reverse ip lookup
    let geo = new GeoCoder();
    return geo.geoip(clientAddress);
  },

  /**
   * shop/updateHeaderTags
   * @summary method to insert or update tag with hierarchy
   * @param {String} tagName will insert, tagName + tagId will update existing
   * @param {String} tagId - tagId to update
   * @param {String} currentTagId - currentTagId will update related/hierarchy
   * @return {Boolean} return true/false after insert
   */
  "shop/updateHeaderTags": function (tagName, tagId, currentTagId) {
    check(tagName, String);
    check(tagId, Match.OneOf(String, null, void 0));
    check(currentTagId, Match.Optional(String));

    let newTagId;
    // must have 'core' permissions
    if (!ReactionCore.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let newTag = {
      slug: getSlug(tagName),
      name: tagName
    };

    let existingTag = Tags.findOne({
      name: tagName
    });

    if (tagId) {
      return Tags.update(tagId, {
        $set: newTag
      }, function () {
        ReactionCore.Log.info(
          `Changed name of tag ${tagId} to ${tagName}`);
        return true;
      });
    } else if (existingTag) {
      // if is currentTag
      if (currentTagId) {
        return Tags.update(currentTagId, {
          $addToSet: {
            relatedTagIds: existingTag._id
          }
        }, function () {
          ReactionCore.Log.info(
            `Added tag ${existingTag.name} to the related tags list for tag ${currentTagId}`
          );
          return true;
        });
      }
      // update existing tag
      return Tags.update(existingTag._id, {
        $set: {
          isTopLevel: true
        }
      }, function () {
        ReactionCore.Log.info('Marked tag "' + existingTag.name +
          '" as a top level tag');
        return true;
      });
    }
    // create newTags
    newTag.isTopLevel = !currentTagId;
    newTag.shopId = ReactionCore.getShopId();
    newTag.updatedAt = new Date();
    newTag.createdAt = new Date();
    newTagId = Tags.insert(newTag);
    if (currentTagId) {
      return Tags.update(currentTagId, {
        $addToSet: {
          relatedTagIds: newTagId
        }
      }, function () {
        ReactionCore.Log.info('Added tag "' + newTag.name +
          '" to the related tags list for tag ' + currentTagId);
        return true;
      });
    } else if (newTagId && !currentTagId) {
      ReactionCore.Log.info('Created tag "' + newTag.name + '"');
      return true;
    }
    throw new Meteor.Error(403, "Failed to update header tags.");
  },

  /**
   * shop/removeHeaderTag
   * @param {String} tagId - method to remove tag navigation tags
   * @param {String} currentTagId - currentTagId
   * @return {String} returns remove result
   */
  "shop/removeHeaderTag": function (tagId, currentTagId) {
    check(tagId, String);
    check(currentTagId, String);
    // must have core permissions
    if (!ReactionCore.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    // remove from related tag use
    Tags.update(currentTagId, {
      $pull: {
        relatedTagIds: tagId
      }
    });
    // check to see if tag is in use.
    let productCount = Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();
    // check to see if in use as a related tag
    let relatedTagsCount = Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();
    // not in use anywhere, delete it
    if (productCount === 0 && relatedTagsCount === 0) {
      return Tags.remove(tagId);
    }
    // unable to delete anything
    throw new Meteor.Error(403, "Unable to delete tags that are in use.");
  },

  /**
   * flushTranslations
   * @summary Helper method to remove all translations, and reload from jsonFiles
   */
  "flushTranslations": function () {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    ReactionCore.Collections.Translations.remove({});
    Fixtures.loadI18n();
    return ReactionCore.Log.info(Meteor.userId() +
      " Flushed Translations.");
  },

  /**
   * shop/getWorkflow
   * @summary gets the current shop workflows
   * @param {String} name - workflow name
   * @return {Array} returns workflow array
   */
  "shop/getWorkflow": function (name) {
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

/**
 * Reaction Shop Methods
 */
Meteor.methods({
  /**
   * shop/createShop
   * @param {String} shopAdminUserId - optionally create shop for provided userId
   * @param {Object} shopData - optionally provide shop object to customize
   * @return {String} return shopId
   */
  "shop/createShop": function (shopAdminUserId, shopData) {
    check(shopAdminUserId, Match.Optional(String));
    check(shopData, Match.Optional(ReactionCore.Schemas.Shop));
    let shop = {};
    // must have owner access to create new shops
    if (!ReactionCore.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // this.unblock();
    const count =  ReactionCore.Collections.Shops.find().count() || "";
    const currentUser = Meteor.userId();
    // we'll accept a shop object, or clone the current shop
    shop = shopData || ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId());
    // if we don't have any shop data, use fixture

    check(shop, ReactionCore.Schemas.Shop);
    if (!currentUser) {
      throw new Meteor.Error("Unable to create shop with specified user");
    }

    // identify a shop admin
    let userId = shopAdminUserId || Meteor.userId();
    let adminRoles = Roles.getRolesForUser(currentUser, ReactionCore.getShopId());
    // ensure unique id and shop name
    shop._id = Random.id();
    shop.name = shop.name + count;

    check(shop, ReactionCore.Schemas.Shop);
    try {
      ReactionCore.Collections.Shops.insert(shop);
    } catch (error) {
      return ReactionCore.Log.error("Failed to shop/createShop", sanitizedError);
    }
    // we should have created new shop, or errored
    ReactionCore.Log.info("Created shop: ", shop._id);
    Roles.addUsersToRoles([currentUser, userId], adminRoles, shop._id);
    return shop._id;
  },

  /**
   * shop/getLocale
   * @summary determine user's countryCode and return locale object
   * determine local currency and conversion rate from shop currency
   * @return {Object} returns user location and locale
   */
  "shop/getLocale": function () {
    this.unblock();
    let clientAddress;
    let geo = new GeoCoder();
    let result = {};
    let defaultCountryCode = "US";
    let localeCurrency = "USD";
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
        if (shop.addressBook[0].country) {
          defaultCountryCode = shop.addressBook[0].country;
        }
      }
    }
    // geocode reverse ip lookup
    let geoCountryCode = geo.geoip(clientAddress).country_code;

    // countryCode either from geo or defaults
    let countryCode = (geoCountryCode || defaultCountryCode).toUpperCase();

    // get currency rates
    result.currency = {};
    result.locale = shop.locales.countries[countryCode];

    // to return default currency if rates will failed, we need to bring access
    // to this data
    result.shopCurrency = shop.currencies[shop.currency];

    // check if locale has a currency defined
    if (typeof result.locale === "object" &&
      typeof result.locale.currency === "string") {
      localeCurrency = result.locale.currency.split(",");
    }

    // localeCurrency is an array of allowed currencies
    _.each(localeCurrency, function (currency) {
      let exchangeRate;
      if (shop.currencies[currency]) {
        result.currency = shop.currencies[currency];
        // only fetch rates if locale and shop currency are not equal
        // if shop.curency = locale currency the rate is 1
        if (shop.currency !== currency) {
          exchangeRate = Meteor.call("shop/getCurrencyRates", currency);

          if (typeof exchangeRate === "number") {
            result.currency.exchangeRate = exchangeRate;
          } else {
            ReactionCore.Log.warn("Failed to get currency exchange rates.");
          }
        }
      }
    });
    // should contain rates, locale, currency
    return result;
  },

  /**
   * shop/getCurrencyRates
   * @summary It returns the current exchange rate against the shop currency
   * usage: Meteor.call("shop/getCurrencyRates","USD")
   * @param {String} currency code
   * @return {Number|Object} currency conversion rate
   */
  "shop/getCurrencyRates": function (currency) {
    check(currency, String);
    this.unblock();

    const field = `currencies.${currency}.rate`;
    const shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId(), {
      fields: { [field]: 1 }
    });

    return typeof shop.currencies[currency].rate === "number" &&
      shop.currencies[currency].rate;
  },

  /**
   * shop/fetchCurrencyRate
   * @summary fetch the latest currency rates from
   * https://openexchangerates.org
   * usage: Meteor.call("shop/fetchCurrencyRate")
   * @fires ReactionCore.Collections.Shops#update
   * @returns {undefined}
   */
  "shop/fetchCurrencyRate": function () {
    this.unblock();

    const shopId = ReactionCore.getShopId();
    const shop = ReactionCore.Collections.Shops.findOne(shopId, {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });
    const baseCurrency = shop.currency || "USD";
    const shopCurrencies = shop.currencies;

    // fetch shop settings for api auth credentials
    const shopSettings = ReactionCore.Collections.Packages.findOne({
      shopId: shopId,
      name: "core"
    }, {
      fields: {
        settings: 1
      }
    });

    // update Shops.currencies[currencyKey].rate
    // with current rates from Open Exchange Rates
    // warn if we don't have app_id
    if (!shopSettings.settings.openexchangerates) {
      throw new Meteor.Error("notConfigured",
        "Open Exchange Rates not configured. Configure for current rates.");
    } else {
      if (!shopSettings.settings.openexchangerates.appId) {
        throw new Meteor.Error("notConfigured",
          "Open Exchange Rates AppId not configured. Configure for current rates.");
      } else {
        // shop open exchange rates appId
        const openexchangeratesAppId = shopSettings.settings.openexchangerates.appId;

        // we'll update all the available rates in Shops.currencies whenever we
        // get a rate request, using base currency
        const rateUrl = `https://openexchangerates.org/api/latest.json?base=${
          baseCurrency}&app_id=${openexchangeratesAppId}`;
        let rateResults;

        // We can get an error if we try to change the base currency with a simple
        // account
        try {
          rateResults = HTTP.get(rateUrl);
        } catch (error) {
          if (error.error) {
            ReactionCore.Log.error(error.message);
            throw new Meteor.Error(error.message);
          } else {
            // https://openexchangerates.org/documentation#errors
            throw new Meteor.Error(error.response.data.description);
          }
        }

        const exchangeRates = rateResults.data.rates;

        _.each(shopCurrencies, function (currencyConfig, currencyKey) {
          if (exchangeRates[currencyKey] !== undefined) {
            let rateUpdate = {
              // this needed for shop/flushCurrencyRates Method
              "currencies.updatedAt": new Date(rateResults.data.timestamp * 1000)
            };
            let collectionKey = `currencies.${currencyKey}.rate`;
            rateUpdate[collectionKey] = exchangeRates[currencyKey];
            ReactionCore.Collections.Shops.update(shopId, {
              $set: rateUpdate
            });
          }
        });
      }
    }
  },

  /**
   * shop/flushCurrencyRate
   * @description Method calls by cron job
   * @summary It removes exchange rates that are too old
   * usage: Meteor.call("shop/flushCurrencyRate")
   * @fires ReactionCore.Collections.Shops#update
   * @returns {undefined}
   */
  "shop/flushCurrencyRate": function () {
    this.unblock();

    const shopId = ReactionCore.getShopId();
    const shop = ReactionCore.Collections.Shops.findOne(shopId, {
      fields: {
        currencies: 1
      }
    });
    let updatedAt = shop.currencies.updatedAt;

    // if updatedAt is not a Date(), then there is no rates yet
    if (typeof updatedAt !== "object") {
      throw new Meteor.Error("notExists",
        "[flushCurrencyRates worker]: There is nothing to flush.");
    }

    updatedAt.setHours(updatedAt.getHours() + 48);
    const now = new Date();

    if (now < updatedAt) { // todo remove this line. its for tests
      _.each(shop.currencies, function (currencyConfig, currencyKey) {
        let rate = `currencies.${currencyKey}.rate`;

        if (typeof currencyConfig.rate === "number") {
          ReactionCore.Collections.Shops.update(shopId, {
            $unset: {
              [rate]: ""
            }
          });
        }
      });
    }
  },

  /**
   * shop/updateShopExternalServices
   * @description On submit OpenExchangeRatesForm handler
   * @summary we need to rerun fetch exchange rates job on every form submit,
   * that's why we update autoform type to "method-update"
   * @param {Object} modifier - the modifier object generated from the form values
   * @param {String} _id - the _id of the document being updated
   * @fires ReactionCore.Collections.Packages#update
   * @todo This method fires Packages collection, so maybe someday it could be
   * @returns {undefined}
   * moved to another file
   */
  "shop/updateShopExternalServices": function (modifier, _id) {
    check(modifier, Match.Optional(ReactionCore.Schemas.CorePackageConfig));
    check(_id, String);

    // must have core permissions
    if (!ReactionCore.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    // we should run new job on every form change, even if not all of them will
    // change currencyRate job
    const refreshPeriod = modifier.$set["settings.openexchangerates.refreshPeriod"];
    const fetchCurrencyRatesJob = new Job(Jobs, "shop/fetchCurrencyRates", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential" // delay by twice as long for each subsequent retry
      })
      .repeat({
        // wait: refreshPeriod * 60 * 1000
        schedule: Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        // Cancel any jobs of the same type,
        // but only if this job repeats forever.
        cancelRepeats: true
      });

    ReactionCore.Collections.Packages.update(_id, modifier);
    return fetchCurrencyRatesJob;
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

    let existingTag = ReactionCore.Collections.Tags.findOne({
      name: tagName
    });

    if (tagId) {
      return ReactionCore.Collections.Tags.update(tagId, {
        $set: newTag
      }, function () {
        ReactionCore.Log.info(
          `Changed name of tag ${tagId} to ${tagName}`);
        return true;
      });
    } else if (existingTag) {
      // if is currentTag
      if (currentTagId) {
        return ReactionCore.Collections.Tags.update(currentTagId, {
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
      return ReactionCore.Collections.Tags.update(existingTag._id, {
        $set: {
          isTopLevel: true
        }
      }, function () {
        ReactionCore.Log.info(`Marked tag ${existingTag.name} as a top level tag`);
        return true;
      });
    }
    // create newTags
    newTag.isTopLevel = !currentTagId;
    newTag.shopId = ReactionCore.getShopId();
    newTag.updatedAt = new Date();
    newTag.createdAt = new Date();
    newTagId = ReactionCore.Collections.Tags.insert(newTag);
    if (currentTagId) {
      return ReactionCore.Collections.Tags.update(currentTagId, {
        $addToSet: {
          relatedTagIds: newTagId
        }
      }, function () {
        ReactionCore.Log.info(`Added tag${newTag.name} to the related tags list for tag ${currentTagId}`);
        return true;
      });
    } else if (newTagId && !currentTagId) {
      ReactionCore.Log.info(`Created tag ${newTag.name}`);
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
    ReactionCore.Collections.Tags.update(currentTagId, {
      $pull: {
        relatedTagIds: tagId
      }
    });
    // check to see if tag is in use.
    let productCount = ReactionCore.Collections.Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();
    // check to see if in use as a related tag
    let relatedTagsCount = ReactionCore.Collections.Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();
    // not in use anywhere, delete it
    if (productCount === 0 && relatedTagsCount === 0) {
      return ReactionCore.Collections.Tags.remove(tagId);
    }
    // unable to delete anything
    throw new Meteor.Error(403, "Unable to delete tags that are in use.");
  },

  /**
   * flushTranslations
   * @summary Helper method to remove all translations, and reload from jsonFiles
   * @return {undefined}
   */
  "flushTranslations": function () {
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    ReactionCore.Collections.Translations.remove({});
    let shopId = ReactionCore.getShopId();
    let shops = ReactionCore.Collections.Shops.find({_id: shopId}).fetch();
    // leaving room for potential future of language per shop
    if (shops) {
      for (let shop of shops) {
        if (shop.languages) {
          for (let language of shop.languages) {
            json = Assets.getText("private/data/i18n/" + language.i18n + ".json");
            ReactionImport.process(json, ["i18n"], ReactionImport.translation);
          }
        }
      }
      ReactionImport.flush();
      ReactionCore.Log.info(Meteor.userId() + " Flushed Translations.");
      return;
    }
    throw new Meteor.Error("No shops found to flush translations for.");
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

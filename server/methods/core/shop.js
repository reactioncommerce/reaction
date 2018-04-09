import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import { HTTP } from "meteor/http";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { GeoCoder, Hooks, Logger } from "/server/api";
import { Reaction } from "/lib/api";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
 * @name cloneShop
 * @summary Returns an existing shop object, with some values removed or changed such
 *   that it is suitable for inserting as a new shop.
 * @method
 * @param {String} shopId - the ID of the shop to clone
 * @return {Object|null} The cloned shop object or null if a shop with that ID can't be found
 */
function cloneShop(shopId) {
  const shop = Collections.Shops.findOne(shopId);
  if (!shop) return null;

  // Never create a second primary shop
  if (shop.shopType === "primary") shop.shopType = "merchant";

  // Ensure unique id and shop name
  const count = Collections.Shops.find().count() || "";
  shop.name += count;

  // Clean up values that get automatically added
  delete shop._id;
  delete shop.createdAt;
  delete shop.updatedAt;
  delete shop.slug;
  // TODO audience permissions need to be consolidated into [object] and not [string]
  // permissions with [string] on layout ie. orders and checkout, cause the insert to fail
  delete shop.layout;
  // delete brandAssets object from shop to prevent new shops from carrying over existing shop's
  // brand image
  delete shop.brandAssets;
  return shop;
}

/**
 * @name updateShopBrandAssets
 * @method
 * @param {Object} asset - brand asset {mediaId: "", type, ""}
 * @param {String} shopId - the shop id coresponding to the shop for which
 *                 the asset should be applied (defaults to Reaction.getShopId())
 * @param {String} userId - the user id on whose behalf we are performing this
 *                 action (defaults to Meteor.userId())
 * @return {Int} returns update result
 */
export function updateShopBrandAssets(asset, shopId = Reaction.getShopId(), userId = Meteor.userId()) {
  check(asset, {
    mediaId: String,
    type: String
  });
  check(shopId, String);

  // must have core permissions
  if (!Reaction.hasPermission("core", userId, shopId)) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Does our shop contain the brandasset we're tring to add
  const shopWithBrandAsset = Collections.Shops.findOne({
    "_id": shopId,
    "brandAssets.type": asset.type
  });

  // If it does, then we update it with the new asset reference
  if (shopWithBrandAsset) {
    return Collections.Shops.update({
      "_id": shopId,
      "brandAssets.type": asset.type
    }, {
      $set: {
        "brandAssets.$": {
          mediaId: asset.mediaId,
          type: asset.type
        }
      }
    });
  }

  // Otherwise we insert a new brand asset reference
  return Collections.Shops.update({
    _id: shopId
  }, {
    $push: {
      brandAssets: {
        mediaId: asset.mediaId,
        type: asset.type
      }
    }
  });
}

/**
 * @file Meteor methods for Shop
 *
 *
 * @namespace Methods/Shop
*/
Meteor.methods({
  /**
   * @name shop/resetShopId
   * @method
   * @memberof Methods/Shop
   * @summary a way for the client to notifiy the server that the shop has
   *          changed. We could has provided #setShopId, however, the server
   *          has all the information it needs to determine this on its own,
   *          and allowing the client to set shopId could be a security risk
   */
  "shop/resetShopId"() {
    return Reaction.resetShopId();
  },

  /**
   * @name shop/createShop
   * @method
   * @memberof Methods/Shop
   * @param {String} shopAdminUserId - optionally create shop for provided userId
   * @param {Object} shopData - optionally provide shop object to customize
   * @return {String} return shopId
   */
  "shop/createShop"(shopAdminUserId, shopData) {
    check(shopAdminUserId, Match.Optional(String));
    if (shopData) {
      Collections.Shops.simpleSchema(shopData).validate(shopData);
      // Never create a second primary shop
      if (shopData.shopType === "primary") shopData.shopType = "merchant";
    }

    // Get the current marketplace settings
    const marketplace = Reaction.getMarketplaceSettings();

    // check to see if the current user has owner permissions for the primary shop
    const hasPrimaryShopOwnerPermission = Reaction.hasPermission("owner", Meteor.userId(), Reaction.getPrimaryShopId());

    // only permit merchant signup if marketplace is enabled and allowMerchantSignup is enabled
    let allowMerchantShopCreation = false;
    if (marketplace && marketplace.enabled && marketplace.public && marketplace.public.allowMerchantSignup) {
      allowMerchantShopCreation = true;
    }

    // must have owner access to create new shops when marketplace is disabled
    if (!hasPrimaryShopOwnerPermission && !allowMerchantShopCreation) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Users may only create shops for themselves
    if (!hasPrimaryShopOwnerPermission && shopAdminUserId !== Meteor.userId()) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Anonymous users should never be permitted to create a shop
    if (!hasPrimaryShopOwnerPermission &&
        Reaction.hasPermission("anonymous", Meteor.userId(), Reaction.getPrimaryShopId())) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const currentUser = Meteor.user();
    const currentAccount = Collections.Accounts.findOne({ _id: currentUser._id });
    if (!currentUser) {
      throw new Meteor.Error("server-error", "Unable to create shop without a user");
    }

    let shopUser = currentUser;
    let shopAccount = currentAccount;

    // TODO: Create a grantable permission for creating shops so we can decouple ownership from shop creation
    // Only marketplace owners can create shops for others
    if (hasPrimaryShopOwnerPermission) {
      shopUser = Meteor.users.findOne({ _id: shopAdminUserId }) || currentUser;
      shopAccount = Collections.Accounts.findOne({ _id: shopAdminUserId }) || currentAccount;
    }

    const primaryShopId = Reaction.getPrimaryShopId();

    // Disallow creation of multiple shops, even for marketplace owners
    if (shopAccount.shopId !== primaryShopId) {
      throw new Meteor.Error(
        "operation-not-permitted",
        "This user already has a shop. Each user may only have one shop."
      );
    }

    // we'll accept a shop object, or clone the current shop
    const shop = shopData || cloneShop(primaryShopId);
    shop.emails = shopUser.emails;
    shop.addressBook = shopAccount.addressBook;

    let newShopId;

    try {
      newShopId = Collections.Shops.insert(shop);
    } catch (error) {
      return Logger.error(error, "Failed to shop/createShop");
    }

    const newShop = Collections.Shops.findOne({ _id: newShopId });

    // we should have created new shop, or errored
    Logger.info("Created shop: ", newShopId);

    // update user
    Reaction.insertPackagesForShop(newShopId);
    Reaction.createGroups({ shopId: newShopId });
    const ownerGroup = Collections.Groups.findOne({ slug: "owner", shopId: newShopId });
    Roles.addUsersToRoles([currentUser, shopUser._id], ownerGroup.permissions, newShopId);
    // Set the active shopId for this user
    Reaction.setUserPreferences("reaction", "activeShopId", newShopId, shopUser._id);
    Collections.Accounts.update({ _id: shopUser._id }, {
      $set: {
        shopId: newShopId
      },
      $addToSet: {
        groups: ownerGroup._id
      }
    });
    Hooks.Events.run("afterAccountsUpdate", currentUser._id, {
      accountId: shopUser._id,
      updatedFields: ["groups"]
    });
    // Add this shop to the merchant
    Collections.Shops.update({ _id: primaryShopId }, {
      $addToSet: {
        merchantShops: {
          _id: newShop._id,
          slug: newShop.slug,
          name: newShop.name
        }
      }
    });

    // Set active shop to new shop.
    return { shopId: newShopId };
  },

  /**
   * @name shop/getLocale
   * @method
   * @memberof Methods/Shop
   * @summary determine user's countryCode and return locale object
   * determine local currency and conversion rate from shop currency
   * @return {Object} returns user location and locale
   */
  "shop/getLocale"() {
    this.unblock();
    let clientAddress;
    const geo = new GeoCoder();
    const result = {};
    let defaultCountryCode = "US";
    let localeCurrency = "USD";
    // if called from server, ip won't be defined.
    if (this.connection !== null) {
      ({ clientAddress } = this.connection);
    } else {
      clientAddress = "127.0.0.1";
    }

    // get shop locale/currency related data
    const shop = Collections.Shops.findOne(Reaction.getShopId(), {
      fields: {
        addressBook: 1,
        locales: 1,
        currencies: 1,
        currency: 1
      }
    });

    if (!shop) {
      throw new Meteor.Error("not-found", "Failed to find shop data. Unable to determine locale.");
    }
    // configure default defaultCountryCode
    // fallback to shop settings
    if (shop.addressBook) {
      if (shop.addressBook.length >= 1) {
        if (shop.addressBook[0].country) {
          defaultCountryCode = shop.addressBook[0].country;
        }
      }
    }
    // geocode reverse ip lookup
    const geoCountryCode = geo.geoip(clientAddress).country_code;

    // countryCode either from geo or defaults
    const countryCode = (geoCountryCode || defaultCountryCode).toUpperCase();

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
    _.each(localeCurrency, (currency) => {
      let exchangeRate;
      if (shop.currencies[currency]) {
        result.currency = shop.currencies[currency];
        // only fetch rates if locale and shop currency are not equal
        // if shop.currency = locale currency the rate is 1
        if (shop.currency !== currency) {
          const settings = Reaction.getShopSettings();
          const exchangeConfig = settings.openexchangerates || {};

          if (exchangeConfig.appId) {
            exchangeRate = Meteor.call("shop/getCurrencyRates", currency);

            if (typeof exchangeRate === "number") {
              result.currency.exchangeRate = exchangeRate;
            } else {
              Logger.warn("Failed to get currency exchange rates.");
            }
          }
        }
      }
    });

    // adjust user currency
    const user = Collections.Accounts.findOne({
      _id: Meteor.userId()
    });
    let profileCurrency = user.profile && user.profile.currency;
    if (!profileCurrency) {
      [localeCurrency] = localeCurrency;
      if (shop.currencies[localeCurrency] && shop.currencies[localeCurrency].enabled) {
        profileCurrency = localeCurrency;
      } else {
        [profileCurrency] = shop.currency.split(",");
      }

      Meteor.call("accounts/setProfileCurrency", profileCurrency);
    }

    // set server side locale
    Reaction.Locale = result;

    // should contain rates, locale, currency
    return result;
  },

  /**
   * @name shop/getCurrencyRates
   * @method
   * @memberof Methods/Shop
   * @summary It returns the current exchange rate against the shop currency
   * usage: Meteor.call("shop/getCurrencyRates","USD")
   * @param {String} currency code
   * @return {Number|Object} currency conversion rate
   */
  "shop/getCurrencyRates"(currency) {
    check(currency, String);
    this.unblock();

    const field = `currencies.${currency}.rate`;
    const shop = Collections.Shops.findOne(Reaction.getShopId(), {
      fields: {
        [field]: 1
      }
    });

    return typeof shop.currencies[currency].rate === "number" &&
      shop.currencies[currency].rate;
  },

  /**
   * @name shop/fetchCurrencyRate
   * @method
   * @memberof Methods/Shop
   * @summary fetch the latest currency rates from
   * https://openexchangerates.org
   * usage: Meteor.call("shop/fetchCurrencyRate")
   * @fires Collections.Shops#update
   * @returns {undefined}
   */
  "shop/fetchCurrencyRate"() {
    this.unblock();

    const shopId = Reaction.getShopId();
    const shop = Collections.Shops.findOne(shopId, {
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
    const shopSettings = Collections.Packages.findOne({
      shopId,
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
      throw new Meteor.Error(
        "not-configured",
        "Open Exchange Rates not configured. Configure for current rates."
      );
    } else if (!shopSettings.settings.openexchangerates.appId) {
      throw new Meteor.Error(
        "not-configured",
        "Open Exchange Rates AppId not configured. Configure for current rates."
      );
    } else {
      // shop open exchange rates appId
      const openexchangeratesAppId = shopSettings.settings.openexchangerates.appId;

      // we'll update all the available rates in Shops.currencies whenever we
      // get a rate request, using base currency
      const rateUrl =
              `https://openexchangerates.org/api/latest.json?base=${
                baseCurrency}&app_id=${openexchangeratesAppId}`;
      let rateResults;

      // We can get an error if we try to change the base currency with a simple
      // account
      try {
        rateResults = HTTP.get(rateUrl);
      } catch (error) {
        if (error.error) {
          Logger.error(error.message);
          throw new Meteor.Error("server-error", error.message);
        } else {
          // https://openexchangerates.org/documentation#errors
          throw new Meteor.Error("server-error", error.response.data.description);
        }
      }

      const exchangeRates = rateResults.data.rates;

      _.each(shopCurrencies, (currencyConfig, currencyKey) => {
        if (exchangeRates[currencyKey] !== undefined) {
          const rateUpdate = {
            // this needed for shop/flushCurrencyRates Method
            "currencies.updatedAt": new Date(rateResults.data.timestamp * 1000)
          };
          const collectionKey = `currencies.${currencyKey}.rate`;
          rateUpdate[collectionKey] = exchangeRates[currencyKey];
          Collections.Shops.update(shopId, {
            $set: rateUpdate
          });
        }
      });
    }
  },

  /**
   * @name shop/flushCurrencyRate
   * @method
   * @memberof Methods/Shop
   * @description Method calls by cron job
   * @summary It removes exchange rates that are too old
   * usage: Meteor.call("shop/flushCurrencyRate")
   * @fires Collections.Shops#update
   * @returns {undefined}
   */
  "shop/flushCurrencyRate"() {
    this.unblock();

    let shopId;
    const marketplaceSettings = Reaction.getMarketplaceSettings();

    if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantLocale) {
      shopId = Reaction.getShopId();
    } else {
      shopId = Reaction.getPrimaryShopId();
    }

    const shop = Collections.Shops.findOne(shopId, {
      fields: {
        currencies: 1
      }
    });
    const { updatedAt } = shop.currencies;

    // if updatedAt is not a Date(), then there is no rates yet
    if (typeof updatedAt !== "object") {
      throw new Meteor.Error(
        "error-occurred",
        "[flushCurrencyRates worker]: There is nothing to flush."
      );
    }

    updatedAt.setHours(updatedAt.getHours() + 48);
    const now = new Date();

    if (now < updatedAt) { // todo remove this line. its for tests
      _.each(shop.currencies, (currencyConfig, currencyKey) => {
        const rate = `currencies.${currencyKey}.rate`;

        if (typeof currencyConfig.rate === "number") {
          Collections.Shops.update(shopId, {
            $unset: {
              [rate]: ""
            }
          });
        }
      });
    }
  },

  /**
   * @name shop/updateShopExternalServices
   * @method
   * @memberof Methods/Shop
   * @description On submit OpenExchangeRatesForm handler
   * @summary we need to rerun fetch exchange rates job on every form submit,
   * that's why we update autoform type to "method-update"
   * @param {Object} details An object with _id and modifier props
   * @fires Collections.Packages#update
   * @todo This method fires Packages collection, so maybe someday it could be moved to another file
   * @returns {undefined}
   */
  "shop/updateShopExternalServices"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens below
    });

    const { _id, modifier } = details;
    Schemas.CorePackageConfig.validate(modifier, { modifier: true });

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();

    // we should run new job on every form change, even if not all of them will
    // change currencyRate job
    const refreshPeriod = modifier.$set["settings.openexchangerates.refreshPeriod"];
    const fetchCurrencyRatesJob = new Job(Collections.Jobs, "shop/fetchCurrencyRates", {})
      .priority("normal")
      .retry({
        retries: 5,
        wait: 60000,
        backoff: "exponential" // delay by twice as long for each subsequent retry
      })
      .repeat({
        // wait: refreshPeriod * 60 * 1000
        schedule: Collections.Jobs.later.parse.text(refreshPeriod)
      })
      .save({
        // Cancel any jobs of the same type,
        // but only if this job repeats forever.
        cancelRepeats: true
      });

    Collections.Packages.update(_id, modifier);
    return fetchCurrencyRatesJob;
  },

  /**
   * @name shop/locateAddress
   * @method
   * @memberof Methods/Shop
   * @summary determine user's full location for autopopulating addresses
   * @param {Number} latitude - latitude
   * @param {Number} longitude - longitude
   * @return {Object} returns address
   */
  "shop/locateAddress"(latitude, longitude) {
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
  },

  /**
   * @name shop/createTag
   * @method
   * @memberof Methods/Shop
   * @summary creates new tag
   * @param {String} tagName - new tag name
   * @param {Boolean} isTopLevel - if true -- new tag will be created on top of
   * tags tree
   * @since 0.14.0
   * @hooks after method
   * @return {String} with created tag _id
   */
  "shop/createTag"(tagName, isTopLevel) {
    check(tagName, String);
    check(isTopLevel, Boolean);

    // must have 'core' permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const tag = {
      name: tagName,
      slug: Reaction.getSlug(tagName),
      isTopLevel,
      updatedAt: new Date(),
      createdAt: new Date()
    };

    return Collections.Tags.insert(tag);
  },

  /**
   * @name shop/updateHeaderTags
   * @method
   * @memberof Methods/Shop
   * @summary method to insert or update tag with hierarchy
   * @param {String} tagName will insert, tagName + tagId will update existing
   * @param {String} tagId - tagId to update
   * @param {String} currentTagId - currentTagId will update related/hierarchy
   * @return {Boolean} return true/false after insert
   */
  "shop/updateHeaderTags"(tagName, tagId, currentTagId) {
    check(tagName, String);
    check(tagId, Match.OneOf(String, null, undefined));
    check(currentTagId, Match.OneOf(String, null, undefined));

    let newTagId = {};
    // must have 'core' permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();

    const newTag = {
      slug: Reaction.getSlug(tagName),
      name: tagName
    };

    const existingTag = Collections.Tags.findOne({
      slug: Reaction.getSlug(tagName),
      name: tagName
    });

    let result;

    if (tagId) {
      result = Collections.Tags.update(tagId, { $set: newTag });
      Logger.debug(`Changed name of tag ${tagId} to ${tagName}`);
      return result;
    }

    if (existingTag) {
      // if is currentTag
      if (currentTagId) {
        result = Collections.Tags.update(currentTagId, {
          $addToSet: {
            relatedTagIds: existingTag._id
          }
        });
        Logger.debug(`Added tag ${existingTag.name} to the related tags list for tag ${currentTagId}`);
        return result;
      }

      // update existing tag
      result = Collections.Tags.update(existingTag._id, {
        $set: {
          isTopLevel: true
        }
      });
      Logger.debug(`Marked tag ${existingTag.name} as a top level tag`);
      return result;
    }

    // create newTags
    newTagId = Meteor.call("shop/createTag", tagName, !currentTagId);

    // if result is an Error object, we return it immediately
    if (typeof newTagId !== "string") return newTagId;

    if (currentTagId) {
      result = Collections.Tags.update(currentTagId, {
        $addToSet: {
          relatedTagIds: newTagId
        }
      });
      Logger.debug(`Added tag${newTag.name} to the related tags list for tag ${currentTagId}`);
      return result;
    }

    // TODO: refactor this. unnecessary check
    if (typeof newTagId === "string" && !currentTagId) return true;

    throw new Meteor.Error("access-denied", "Failed to update header tags.");
  },

  /**
   * @name shop/removeHeaderTag
   * @method
   * @memberof Methods/Shop
   * @param {String} tagId - method to remove tag navigation tags
   * @param {String} currentTagId - currentTagId
   * @return {String} returns remove result
   */
  "shop/removeHeaderTag"(tagId, currentTagId) {
    check(tagId, String);
    check(currentTagId, String);
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();
    // remove from related tag use
    Collections.Tags.update(currentTagId, {
      $pull: {
        relatedTagIds: tagId
      }
    });
    // check to see if tag is in use.
    const productCount = Collections.Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();
    // check to see if in use as a related tag
    const relatedTagsCount = Collections.Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();
    // not in use anywhere, delete it
    if (productCount === 0 && relatedTagsCount === 0) {
      return Collections.Tags.remove(tagId);
    }
    // unable to delete anything
    throw new Meteor.Error("access-denied", "Unable to delete tags that are in use.");
  },

  /**
   * @name shop/hideHeaderTag
   * @method
   * @memberof Methods/Shop
   * @param {String} tagId - method to remove tag navigation tags
   * @return {String} returns remove result
   */
  "shop/hideHeaderTag"(tagId) {
    check(tagId, String);
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();
    // hide it
    return Collections.Tags.update({
      _id: tagId
    }, {
      $set: {
        isTopLevel: false
      }
    });
  },

  /**
   * @name shop/getWorkflow
   * @method
   * @memberof Methods/Shop
   * @summary gets the current shop workflows
   * @param {String} name - workflow name
   * @return {Array} returns workflow array
   */
  "shop/getWorkflow"(name) {
    check(name, String);

    const shopWorkflows = Collections.Shops.findOne({
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
  },

  /**
   * @name shop/updateLanguageConfiguration
   * @method
   * @memberof Methods/Shop
   * @summary enable / disable a language
   * @param {String} language - language name | "all" to bulk enable / disable
   * @param {Boolean} enabled - true / false
   * @return {Array} returns workflow array
   */
  "shop/updateLanguageConfiguration"(language, enabled) {
    check(language, String);
    check(enabled, Boolean);

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();

    const shop = Collections.Shops.findOne({
      _id: Reaction.getShopId()
    });

    const defaultLanguage = shop.language;

    if (language === "all") {
      const updateObject = {};

      if (Array.isArray(shop.languages)) {
        shop.languages.forEach((languageData, index) => {
          if (languageData.i18n === defaultLanguage) {
            updateObject[`languages.${index}.enabled`] = true;
          } else {
            updateObject[`languages.${index}.enabled`] = enabled;
          }
        });
      }
      return Collections.Shops.update({
        _id: Reaction.getShopId()
      }, {
        $set: updateObject
      });
    } else if (language === defaultLanguage) {
      return Collections.Shops.update({
        "_id": Reaction.getShopId(),
        "languages.i18n": language
      }, {
        $set: {
          "languages.$.enabled": true
        }
      });
    }

    return Collections.Shops.update({
      "_id": Reaction.getShopId(),
      "languages.i18n": language
    }, {
      $set: {
        "languages.$.enabled": enabled
      }
    });
  },

  /**
   * @name shop/updateCurrencyConfiguration
   * @method
   * @memberof Methods/Shop
   * @summary enable / disable a currency
   * @param {String} currency - currency name | "all" to bulk enable / disable
   * @param {Boolean} enabled - true / false
   * @return {Number} returns mongo update result
   */
  "shop/updateCurrencyConfiguration"(currency, enabled) {
    check(currency, String);
    check(enabled, Boolean);
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    this.unblock();

    const shop = Collections.Shops.findOne({
      _id: Reaction.getShopId()
    });

    const defaultCurrency = shop.currency;

    if (currency === "all") {
      const updateObject = {};
      for (const currencyName in shop.currencies) {
        if ({}.hasOwnProperty.call(shop.currencies, currencyName) && currencyName !== "updatedAt") {
          if (currencyName === defaultCurrency) {
            updateObject[`currencies.${currencyName}.enabled`] = true;
          } else {
            updateObject[`currencies.${currencyName}.enabled`] = enabled;
          }
        }
      }

      return Collections.Shops.update({
        _id: Reaction.getShopId()
      }, {
        $set: updateObject
      });
    } else if (currency === defaultCurrency) {
      return Collections.Shops.update({
        _id: Reaction.getShopId()
      }, {
        $set: {
          [`currencies.${currency}.enabled`]: true
        }
      });
    }

    return Collections.Shops.update({
      _id: Reaction.getShopId()
    }, {
      $set: {
        [`currencies.${currency}.enabled`]: enabled
      }
    });
  },

  /**
   * @name shop/updateBrandAsset
   * @method
   * @memberof Methods/Shop
   * @param {Object} asset - brand asset {mediaId: "", type, ""}
   * @return {Int} returns update result
   */
  "shop/updateBrandAssets"(asset) {
    check(asset, {
      mediaId: String,
      type: String
    });

    this.unblock();

    return updateShopBrandAssets(asset);
  },

  /**
   * @name shop/togglePackage
   * @method
   * @memberof Methods/Shop
   * @summary enable/disable Reaction package
   * @param {String} packageId - package _id
   * @param {Boolean} enabled - current package `enabled` state
   * @return {Number} mongo update result
   */
  "shop/togglePackage"(packageId, enabled) {
    check(packageId, String);
    check(enabled, Boolean);
    if (!Reaction.hasAdminAccess()) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return Collections.Packages.update(packageId, {
      $set: {
        enabled: !enabled
      }
    });
  },

  /**
   * @name shop/changeLayout
   * @method
   * @memberof Methods/Shop
   * @summary Change the layout for all workflows so you can use a custom one
   * @param {String} shopId - the shop's ID
   * @param {String} newLayout - new layout to use
   * @return {Number} mongo update result
   */
  "shop/changeLayouts"(shopId, newLayout) {
    check(shopId, String);
    check(newLayout, String);
    const shop = Collections.Shops.findOne(shopId);
    for (let i = 0; i < shop.layout.length; i += 1) {
      shop.layout[i].layout = newLayout;
    }
    return Collections.Shops.update(shopId, {
      $set: { layout: shop.layout }
    });
  },


  /**
   * @name shop/getBaseLanguage
   * @method
   * @memberof Methods/Shop
   * @summary Return the shop's base language ISO code
   * @return {String} ISO lang code
   */
  "shop/getBaseLanguage"() {
    if (!Reaction.hasPermission()) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const shopId = Reaction.getShopId();
    return Collections.Shops.findOne(shopId).language;
  }
});

import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Accounts, Shops } from "/lib/collections";
import { Reaction } from "/lib/api";
import GeoCoder from "../../util/geocoder";

/**
 * @name shop/getLocale
 * @method
 * @memberof Shop/Methods
 * @summary determine user's countryCode and return locale object
 * determine local currency and conversion rate from shop currency
 * @return {Object} returns user location and locale
 */
export default function getLocale() {
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
  const shop = Shops.findOne(Reaction.getShopId(), {
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
  const account = Accounts.findOne({ userId: Meteor.userId() });
  let profileCurrency = account && account.profile && account.profile.currency;
  if (account && !profileCurrency) {
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
}

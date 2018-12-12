import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { HTTP } from "meteor/http";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Packages, Shops } from "/lib/collections";

/**
 * @name shop/fetchCurrencyRate
 * @method
 * @memberof Shop/Methods
 * @summary fetch the latest currency rates from
 * https://openexchangerates.org
 * usage: Meteor.call("shop/fetchCurrencyRate")
 * @fires Collections.Shops#update
 * @returns {undefined}
 */
export default function fetchCurrencyRate() {
  const shopId = Reaction.getShopId();
  const shop = Shops.findOne(shopId, {
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
  const shopSettings = Packages.findOne({
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
    throw new ReactionError(
      "not-configured",
      "Open Exchange Rates not configured. Configure for current rates."
    );
  } else if (!shopSettings.settings.openexchangerates.appId) {
    throw new ReactionError(
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
        throw new ReactionError("server-error", error.message);
      } else {
        // https://openexchangerates.org/documentation#errors
        throw new ReactionError("server-error", error.response.data.description);
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
        Shops.update(shopId, {
          $set: rateUpdate
        });
      }
    });
  }
}

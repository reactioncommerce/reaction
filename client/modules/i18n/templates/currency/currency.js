import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Meteor } from "meteor/meteor";

Template.currencySelect.helpers({
  currencies() {
    const currencies = [];
    if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
      const shop = Shops.findOne(Reaction.getShopId(), {
        fields: {
          currencies: 1,
          currency: 1
        }
      });
      const locale = Reaction.Locale.get();
      if (Match.test(shop, Object) && shop.currencies) {
        for (const currencyName in shop.currencies) {
          if (shop.currencies[currencyName].enabled === true) {
            const currency = { currency: currencyName };
            const localStorageCurrency = localStorage.getItem("currency");
            // only one currency will be "active". Either the one
            // matching the localStorageCurrency if exists or else
            //  the one matching shop currency
            if (localStorageCurrency) {
              if (localStorageCurrency === currency.currency) {
                currency.class = "active";
              }
            } else if (shop.currency === currency.currency) {
              currency.class = "active";
            }
            currency.symbol = shop.currencies[currencyName].symbol;
            currencies.push(currency);
          }
        }
        if (currencies.length > 1) {
          return currencies;
        }
      }
    }
    return currencies;
  },

  currentCurrency() {
    if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
      const shop = Shops.findOne(Reaction.getShopId(), {
        fields: {
          currencies: 1,
          currency: 1
        }
      });
      const profile = Meteor.user().profile;
      if (Match.test(shop, Object) && shop.currency) {
        const localStorageCurrency = localStorage.getItem("currency");
        if (localStorageCurrency) {
          return localStorageCurrency + " " + shop.currencies[localStorageCurrency].symbol;
        } else {
          const locale = Reaction.Locale.get();
          if (locale && locale.currency && locale.currency.enabled) {
            return locale.locale.currency + " " + locale.currency.symbol;
          } else {
            return shop.currency + " " + shop.currencies[shop.currency].symbol;
          }
        }
      }
    }
    return "GBP £";
  }
});

Template.currencySelect.events({
  "click .currency"(event) {
    event.preventDefault();
    //
    // this is a sanctioned use of Meteor.user.update
    // and only possible because we allow it in the
    // UserProfile and ShopMembers publications.
    //
    Meteor.users.update(Meteor.userId(), { $set: { "profile.currency": this.currency } });
    localStorage.setItem("currency", this.currency);
  }
});

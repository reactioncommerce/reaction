import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Cart, Shops } from "/lib/collections";
import Currency from "../components/currency";

class CurrencyContainer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (value) => {
    const currency = value.split(" ");
    const currencyName = currency[0];
    //
    // this is a sanctioned use of Meteor.user.update
    // and only possible because we allow it in the
    // UserProfile and ShopMembers publications.
    //
    Meteor.users.update(Meteor.userId(), { $set: { "profile.currency": currencyName } });
    localStorage.setItem("currency", currencyName);

    const cart = Cart.findOne({ userId: Meteor.userId() });

    // Attach changed currency to this users cart
    Meteor.call("cart/setUserCurrency", cart._id, currencyName);
  }

  render() {
    return (
      <div>
        <Currency
          {...this.props}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  let currentCurrency = "USD $";
  const currencies = [];

  if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
    const shop = Shops.findOne(Reaction.getShopId(), {
      fields: {
        currencies: 1,
        currency: 1
      }
    });
    if (Match.test(shop, Object) && shop.currency) {
      const localStorageCurrency = localStorage.getItem("currency");
      const locale = Reaction.Locale.get();

      if (localStorageCurrency) {
        currentCurrency = localStorageCurrency + " " + shop.currencies[localStorageCurrency].symbol;
      } else if (locale && locale.currency && locale.currency.enabled) {
        currentCurrency = locale.locale.currency + " " + locale.currency.symbol;
      } else {
        currentCurrency = shop.currency + " " + shop.currencies[shop.currency].symbol;
      }
    }

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
    }
  }

  onData(null, {
    currentCurrency: currentCurrency,
    currencies: currencies
  });
};

export default composeWithTracker(composer, null)(CurrencyContainer);


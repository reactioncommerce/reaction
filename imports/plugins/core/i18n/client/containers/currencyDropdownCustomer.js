import { compose, withProps } from "recompose";
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import withViewer from "/imports/plugins/core/graphql/lib/hocs/withViewer";
import withChangeCurrency from "/imports/plugins/core/graphql/lib/hocs/withChangeCurrency";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import { getSlug } from "/lib/api";
import CurrencyDropdown from "../components/currencyDropdown";

const handlers = {
  handleChange(value) {
    const currency = value.split(" ");
    const currencyCode = currency[0];
    // update Accounts with the selected currency
    this.changeCurrency({ variables: { input: { accountId: this.viewer._id, currencyCode } } });

    const { cart, token } = getCart();
    if (!cart) return;

    // Attach changed currency to this users cart
    Meteor.call("cart/setUserCurrency", cart._id, token, currencyCode);
  }
};

const wrapComponent = (Comp) => (
  class CurrencyDropdownCustomerContainer extends Component {
    render() {
      const { viewer: user, shop } = this.props;
      let currentCurrency = "USD $";
      const currencies = [];
      const profileCurrency = user && user.currency;
      if (shop && shop.currency) {
        const locale = Reaction.Locale.get();

        if (profileCurrency && profileCurrency.code && profileCurrency.symbol) {
          currentCurrency = `${profileCurrency.code} ${profileCurrency.symbol}`;
        } else if (locale && locale.currency && locale.currency.enabled) {
          currentCurrency = `${locale.locale.currency.split(",")[0]} ${locale.currency.symbol}`;
        } else {
          currentCurrency = `${shop.currency.code} ${shop.currency.symbol}`;
        }
        shop.currencies.forEach((curr) => {
          if (curr.enabled === true) {
            const currency = { currency: curr.code };
            // only one currency will be "active". Either the one
            // matching the profileCurrency if it exists or else
            //  the one matching shop currency
            if (profileCurrency) {
              if (profileCurrency === currency.currency) {
                currency.class = "active";
              }
            } else if (shop.currency.code === currency.currency) {
              currency.class = "active";
            }
            currency.symbol = curr.symbol;
            currencies.push(currency);
          }
        });
      }

      return (
        <div>
          <Comp
            {...this.props}
            currentCurrency={currentCurrency}
            currencies={currencies}
          />
        </div>
      );
    }
  }
);

const composer = (props, onData) => {
  onData(null, { ...props, shopSlug: getSlug(Reaction.getShopName().toLowerCase()) });
};

registerComponent("CurrencyDropdownCustomer", CurrencyDropdown, [
  composeWithTracker(composer),
  withProps(handlers),
  withShopId,
  withShop,
  withViewer,
  withChangeCurrency,
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers),
  withShopId,
  withShop,
  withViewer,
  withChangeCurrency,
  wrapComponent
)(CurrencyDropdown);

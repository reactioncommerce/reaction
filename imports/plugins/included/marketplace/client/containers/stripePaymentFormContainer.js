import React, { Component } from "react";
import PropTypes from "prop-types";
import { Elements, StripeProvider } from "react-stripe-elements";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { i18next, Reaction, Router } from "/client/api";
import { Packages } from "/lib/collections";
import { unstoreAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import buildOrderInputFromCart from "/imports/plugins/core/cart/client/util/buildOrderInputFromCart";
import { placeOrder } from "../util/graphql";
import InjectedCardForm from "../components/injectedCardForm";

class StripePaymentFormContainer extends Component {
  static propTypes = {
    apiKey: PropTypes.string,
    errorCodes: PropTypes.object,
    language: PropTypes.string,
    onSubmit: PropTypes.func,
    postal: PropTypes.string
  }

  render() {
    const { apiKey, errorCodes, onSubmit, postal } = this.props;

    return (
      <StripeProvider apiKey={apiKey}>
        <Elements fonts={[{ cssSrc: "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" }]}>
          <InjectedCardForm errorCodes={errorCodes} onSubmit={onSubmit} postal={postal} />
        </Elements>
      </StripeProvider>
    );
  }
}

/**
 * @summary Builds a submit handler function
 * @param {Object} billingAddress Address to be sent with placeOrder mutation
 * @param {Object} cart Cart document
 * @param {String} [cartToken] Token for anonymous carts
 * @returns {Function} onSubmit function
 */
function getSubmitHandler(billingAddress, cart, cartToken) {
  return async function placeOrderWithStripe(stripeTokenId) {
    // Build the order input
    const order = await buildOrderInputFromCart(cart);

    // Build the payment input
    const amount = order.fulfillmentGroups.reduce((sum, group) => sum + group.totalPrice, 0);
    const payments = [{
      amount,
      billingAddress,
      data: {
        stripeTokenId
      },
      method: "marketplace_stripe_card"
    }];

    await placeOrder({ input: { order, payments } });

    // If there wasn't an error, the cart has been deleted.
    if (cartToken) {
      unstoreAnonymousCart(cart._id);
    }

    Router.go("cart/completed", {}, {
      _id: cart._id
    });
  };
}

/**
 * @summary StripePaymentFormContainer composer
 * @param {Object} props Passed in props
 * @param {Function} onData Call this with more props
 * @returns {undefined}
 */
function composer(props, onData) {
  const subscription = Reaction.Subscriptions.Packages;
  const stripePackage = Packages.findOne({
    name: "reaction-marketplace",
    shopId: Reaction.getPrimaryShopId()
  });

  const { cart, token } = getCart();
  if (!cart || !subscription.ready()) return;

  const { billingAddress: cartBillingAddress } = cart;
  const billingAddress = {
    address1: cartBillingAddress.address1,
    address2: cartBillingAddress.address2,
    city: cartBillingAddress.city,
    country: cartBillingAddress.country,
    fullName: cartBillingAddress.fullName,
    isCommercial: cartBillingAddress.isCommercial,
    phone: cartBillingAddress.phone,
    postal: cartBillingAddress.postal,
    region: cartBillingAddress.region
  };

  /* eslint-disable camelcase */
  const errorCodes = {
    card_declined: i18next.t("checkout.errorMessages.cardDeclined"),
    country_unsupported: i18next.t("checkout.errorMessages.countryUnsupported"),
    expired_card: i18next.t("checkout.errorMessages.expiredCard"),
    incomplete_cvc: i18next.t("checkout.errorMessages.incompleteCVC"),
    incomplete_expiry: i18next.t("checkout.errorMessages.incompleteExpiry"),
    incomplete_number: i18next.t("checkout.errorMessages.incompleteNumber"),
    incomplete_zip: i18next.t("checkout.errorMessages.incompleteZIP"),
    incorrect_cvc: i18next.t("checkout.errorMessages.incorrectCVC"),
    incorrect_number: i18next.t("checkout.errorMessages.incorrectNumber"),
    incorrect_zip: i18next.t("checkout.errorMessages.incorrectZIP"),
    invalid_cvc: i18next.t("checkout.errorMessages.invalidCVC"),
    invalid_expiry_month: i18next.t("checkout.errorMessages.invalidExpiryMonth"),
    invalid_expiry_year: i18next.t("checkout.errorMessages.invalidExpiryYear"),
    invalid_expiry_month_past: i18next.t("checkout.errorMessages.incompleteExpiryMonthPast"),
    invalid_expiry_year_past: i18next.t("checkout.errorMessages.incompleteExpiryYearPast"),
    invalid_number: i18next.t("checkout.errorMessages.invalidNumber"),
    postal_code_invalid: i18next.t("checkout.errorMessages.postalCodeInvalid"),
    state_unsupported: i18next.t("checkout.errorMessages.stateUnsupported"),
    whoops: i18next.t("checkout.errorMessages.whoops")
  };

  onData(null, {
    apiKey: stripePackage.settings.public.publishable_key,
    errorCodes,
    language: i18next.language,
    onSubmit: getSubmitHandler(billingAddress, cart, token),
    postal: cartBillingAddress.postal
  });
}

const decoratedComponent = composeWithTracker(composer)(StripePaymentFormContainer);

export default decoratedComponent;

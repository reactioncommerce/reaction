import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Packages, Cart } from "/lib/collections";
import { Elements, StripeProvider } from "react-stripe-elements";
import InjectedCardForm from "./injectedCardForm";

class StripePaymentFormContainer extends Component {
  static propTypes = {
    apiKey: PropTypes.string,
    cartId: PropTypes.string
  }

  render() {
    return (
      <StripeProvider apiKey={this.props.apiKey}>
        <Elements>
          <InjectedCardForm cartId={this.props.cartId} />
        </Elements>
      </StripeProvider>
    );
  }
}

function composer(props, onData) {
  const subscription = Reaction.Subscriptions.Packages;
  const stripePackage = Packages.findOne({
    name: "reaction-stripe",
    shopId: Reaction.getPrimaryShopId()
  });
  const checkoutCart = Cart.findOne({ userId: Meteor.userId() });
  if (subscription.ready()) {
    onData(null, {
      apiKey: stripePackage.settings.public.publishable_key,
      cartId: checkoutCart._id
    });
  } else {
    onData(null, {});
  }
}

const decoratedComponent = composeWithTracker(composer)(StripePaymentFormContainer);

export default decoratedComponent;

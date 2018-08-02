import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, i18next } from "/client/api";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import { getAnonymousCartsReactive } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import LoginInline from "../components/loginInline";

class LoginInlineContainer extends Component {
  static propTypes = {
    isStripeEnabled: PropTypes.bool
  }

  constructor(props) {
    super(props);

    this.state = {
      isStripeEnabled: props.isStripeEnabled,
      renderEmailForm: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isStripeEnabled: nextProps.isStripeEnabled
    });
  }

  pushCartWorkflow = () => {
    const { cart } = getCart();
    if (cart) {
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin", cart._id, (error) => {
        if (error) {
          // Do not bother to try to advance workflow if we can't go beyond login.
          return;
        }
        // If there's already a billing and shipping address selected, push beyond address book
        const { cart: updatedCart } = getCart();
        if (updatedCart && updatedCart.billing[0] && updatedCart.billing[0].address
          && updatedCart.shipping[0] && updatedCart.shipping[0].address) {
          Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook", updatedCart._id);
        }
      });
    }
  }

  continueAsGuest = (event) => {
    event.preventDefault();
    if (this.state.isStripeEnabled) {
      this.setState({
        renderEmailForm: true
      });
    } else {
      this.pushCartWorkflow();
    }
  }

  /**
   * @method handleEmailSubmit
   * @summary Handle submitting the email form
   * @param {Event} event - the event that fired
   * @param {String} email - anonymous user's email
   * @return {undefined} undefined
   * @private
   */
  handleEmailSubmit = (event, email) => {
    event.preventDefault();
    const { cart } = getCart();
    if (cart) {
      const anonymousCarts = getAnonymousCartsReactive();
      const cartInfo = anonymousCarts.find((anonymousCart) => anonymousCart._id === cart._id);
      Meteor.call("cart/setAnonymousUserEmail", cart._id, cartInfo.token, email, (error) => {
        if (error) {
          Alerts.toast(i18next.t("mail.alerts.addCartEmailFailed"), "error");
        } else {
          this.pushCartWorkflow();
        }
      });
    }
  }

  render() {
    return (
      <LoginInline
        continueAsGuest={this.continueAsGuest}
        renderEmailForm={this.state.renderEmailForm}
        handleEmailSubmit={this.handleEmailSubmit}
      />
    );
  }
}

function composer(props, onData) {
  let isStripeEnabled = false;
  const subscription = Reaction.Subscriptions.Packages;
  const primaryShopId = Reaction.getPrimaryShopId();

  const stripePkg = Reaction.getPackageSettingsWithOptions({
    shopId: primaryShopId,
    name: "reaction-stripe",
    enabled: true
  });

  if (subscription.ready()) {
    if (stripePkg) {
      isStripeEnabled = true;
    }

    onData(null, {
      isStripeEnabled
    });
  }
}

registerComponent("LoginInline", LoginInlineContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(LoginInlineContainer);

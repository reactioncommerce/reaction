import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import Logger from "/client/modules/logger";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import { getAnonymousCartsReactive } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import LoginInline from "../components/loginInline";

const setEmailOnAnonymousCartMutation = gql`
  mutation SetEmailOnAnonymousCart($input: SetEmailOnAnonymousCartInput!) {
    setEmailOnAnonymousCart(input: $input) {
      cart {
        _id
        email
      }
    }
  }
`;

/**
 * @summary Push cart workflow past "checkoutLogin" and potentially past "checkoutAddressBook"
 * @returns {undefined}
 */
function pushCartWorkflow() {
  const { cart } = getCart();
  if (cart) {
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin", cart._id, (error) => {
      if (error) {
        // Do not bother to try to advance workflow if we can't go beyond login.
        Logger.error(error);
        return;
      }
      // If there's already a billing and shipping address selected, push beyond address book
      const { cart: updatedCart } = getCart();
      if (updatedCart && updatedCart.billing[0] && updatedCart.billing[0].address
        && updatedCart.shipping[0] && updatedCart.shipping[0].address) {
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutAddressBook", updatedCart._id, (error2) => {
          if (error2) {
            Logger.error(error2);
          }
        });
      }
    });
  }
}

function handleEmailSubmitError(error) {
  Logger.error(error);
  Alerts.toast(i18next.t("mail.alerts.addCartEmailFailed"), "error");
}

class LoginInlineContainer extends Component {
  static propTypes = {
    cart: PropTypes.shape({
      _id: PropTypes.string.isRequired
    }),
    token: PropTypes.string
  }

  state = {
    renderEmailForm: false
  }

  handleContinueAsGuest = (event) => {
    event.preventDefault();
    this.setState({
      renderEmailForm: true
    });
  }

  render() {
    const { cart, token } = this.props;

    if (!cart) return null;

    return (
      <Mutation
        ignoreResults
        mutation={setEmailOnAnonymousCartMutation}
        onCompleted={pushCartWorkflow}
        onError={handleEmailSubmitError}
      >
        {(setEmailOnAnonymousCart) => (
          <LoginInline
            continueAsGuest={this.handleContinueAsGuest}
            renderEmailForm={this.state.renderEmailForm}
            handleEmailSubmit={(event, email) => {
              event.preventDefault();
              Meteor.call("getOpaqueIdFromInternalId", "Cart", cart._id, (error, opaqueCartId) => {
                if (error || !opaqueCartId) {
                  Logger.error(error || "No opaque cart ID returned");
                  return;
                }
                setEmailOnAnonymousCart({ variables: { input: { cartId: opaqueCartId, email, token } } });
              });
            }}
          />
        )}
      </Mutation>
    );
  }
}

/**
 * @summary Composer for LoginInline component
 * @param {Object} props Props from parent
 * @param {Function} onData Data callback
 * @returns {undefined}
 */
function composer(props, onData) {
  const { cart } = getCart();
  let token = null;
  if (cart) {
    const anonymousCarts = getAnonymousCartsReactive();
    const cartInfo = anonymousCarts.find((anonymousCart) => anonymousCart._id === cart._id);
    ({ token } = cartInfo || {});
  }

  onData(null, {
    cart,
    token
  });
}

registerComponent("LoginInline", LoginInlineContainer, composeWithTracker(composer));

export default composeWithTracker(composer)(LoginInlineContainer);

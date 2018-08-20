import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction, i18next } from "/client/api";
import CartPanelCustomer from "../components/cartPanelCustomer";

const wrapComponent = (Comp) => {
  class CartPanelContainer extends Component {
    static propTypes = {
      cartAlertMessage: PropTypes.string,
      cartAlertWidth: PropTypes.number,
      direction: PropTypes.string,
      isCartAlertVisible: PropTypes.bool,
      shouldDisplaySpinner: PropTypes.bool
    };

    checkout() {
      document.querySelector("#cart-drawer-container").classList.remove("opened");
      Session.set("displayCart", false);
      return Reaction.Router.go("cart/checkout");
    }

    render() {
      const { cartAlertMessage, cartAlertWidth, direction, isCartAlertVisible, shouldDisplaySpinner } = this.props;
      let width = 225;
      if (cartAlertWidth > 225) {
        width = 252;
      }
      const style = {
        right: -width,
        left: "auto",
        transform: "translate(0, 0)",
        transitionTimingFunction: "ease-in",
        transition: "0.5s"
      };
      if (direction === "rtl") {
        style.right = "auto";
        style.left = -width;
      }

      if (isCartAlertVisible) {
        if (direction === "rtl") {
          style.transform = `translate(${width}px, 0)`;
        } else {
          style.transform = `translate(${-width}px, 0)`;
        }
        style.transitionTimingFunction = "ease-out";
      }
      return (
        <div className="cart-alert-customer" style={style}>
          <Comp
            cartAlertMessage={cartAlertMessage}
            shouldDisplaySpinner={shouldDisplaySpinner}
            checkout={this.checkout}
            {...this.props}
          />
        </div>
      );
    }
  }
  return CartPanelContainer;
};

/**
 * @name composer
 * @private
 * @summary Loads cartPanel props from Session
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {undefined}
 */
function composer(props, onData) {
  const cartAlertMessage = Session.get("cartAlertMessage");
  const cartAlertWidth = Session.get("cartAlertWidth");
  const isCartAlertVisible = Session.get("isCartAlertVisible");
  const shouldDisplaySpinner = Session.get("cartAlertShouldDisplaySpinner");
  const direction = i18next.dir();

  onData(null, {
    cartAlertMessage,
    cartAlertWidth,
    direction,
    isCartAlertVisible,
    shouldDisplaySpinner
  });
}

registerComponent("CartPanelCustomer", CartPanelCustomer, [composeWithTracker(composer), wrapComponent]);

// Decorate component and export
export default compose(composeWithTracker(composer), wrapComponent)(CartPanelCustomer);


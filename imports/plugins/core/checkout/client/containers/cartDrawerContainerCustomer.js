import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";

const CartDrawerContainerCustomer = (props) => {
  const { isEmpty } = props;
  if (isEmpty) {
    return <Components.EmptyCartDrawer />;
  }
  return <Components.FilledCartDrawerCustomer {...props} />;
};

CartDrawerContainerCustomer.propTypes = {
  isEmpty: PropTypes.bool
};

function composer(props, onData) {
  const isEmpty = !props.cartItems || props.cartItems.length === 0
  onData(null, {
    isEmpty
  });
}

registerComponent("CartDrawerCustomer", CartDrawerContainerCustomer, [
  composeWithTracker(composer)
]);

export default compose(
  composeWithTracker(composer)
)(CartDrawerContainerCustomer);

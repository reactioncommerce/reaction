import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

const CartDrawerContainerAdmin = (props) => {
  const { isEmpty } = props;
  if (isEmpty) {
    return <Components.EmptyCartDrawer />;
  }
  return <Components.FilledCartDrawerAdmin />;
};

CartDrawerContainerAdmin.propTypes = {
  isEmpty: PropTypes.bool
};

function composer(props, onData) {
  const { cart } = getCart();
  const isEmpty = !cart || !cart.items || (cart.items.length === 0);
  onData(null, {
    isEmpty
  });
}

registerComponent("CartDrawerAdmin", CartDrawerContainerAdmin, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(CartDrawerContainerAdmin);

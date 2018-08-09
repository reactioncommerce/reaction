import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker, Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

const ProductDetailSimple = ({ isAdmin }) => {
  if (isAdmin) {
    return <Components.ProductDetail />;
  }
  return <Components.ProductDetailCustomer />;
};

ProductDetailSimple.propTypes = {
  isAdmin: PropTypes.bool
};

function composer(props, onData) {
  const isAdmin = Reaction.hasAdminAccess();
  onData(null, {
    isAdmin
  });
}

registerComponent("ProductDetailSimple", ProductDetailSimple, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(ProductDetailSimple);

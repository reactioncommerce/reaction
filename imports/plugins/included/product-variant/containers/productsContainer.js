import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import ProductsContainerAdmin from "./productsContainerAdmin.js";
import ProductsContainerCustomer from "./productsContainerCustomer.js";

const ProductsContainer = ({ isAdmin }) => {
  if (isAdmin) {
    return <ProductsContainerAdmin />;
  }
  return <ProductsContainerCustomer />;
};

ProductsContainer.propTypes = {
  isAdmin: PropTypes.bool
};

function composer(props, onData) {
  const isAdmin = Reaction.hasPermission("createProduct", Meteor.userId());

  onData(null, {
    isAdmin
  });
}

registerComponent("Products", ProductsContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(ProductsContainer);

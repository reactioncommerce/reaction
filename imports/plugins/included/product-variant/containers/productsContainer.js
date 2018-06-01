import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker, Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";

const ProductsContainer = ({ isAdmin }) => {
  if (isAdmin) {
    return <Components.ProductsAdmin />;
  }
  return <Components.ProductsCustomer />;
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

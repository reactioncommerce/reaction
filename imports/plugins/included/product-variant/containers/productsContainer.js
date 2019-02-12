import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker, Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

const ProductsContainer = ({ isAdmin }) => (isAdmin ? <Components.ProductsAdmin /> : null);

ProductsContainer.propTypes = {
  isAdmin: PropTypes.bool
};

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const isAdmin = Reaction.hasPermission("createProduct", Reaction.getUserId());

  onData(null, {
    isAdmin
  });
}

registerComponent("Products", ProductsContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(ProductsContainer);

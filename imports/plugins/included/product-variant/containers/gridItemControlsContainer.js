import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Validation } from "@reactioncommerce/schemas";
import { Reaction } from "/client/api";
import GridItemControls from "../components/gridItemControls";
import { ReactionProduct } from "/lib/api";
import { ProductVariant } from "/lib/collections/schemas";

const wrapComponent = (Comp) => (
  class GridItemControlsContainer extends Component {
    static propTypes = {
      isSelected: PropTypes.bool,
      product: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.validation = new Validation(ProductVariant);
      this.validProduct = props.product;
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
      this.checkValidation();
    }

    // This method checks validation of the variants of the all the products on the Products grid to
    // check whether all required fields have been submitted before publishing
    checkValidation() {
      const { product } = this.props;

      // this returns an array with a single object
      const variants = ReactionProduct.getVariants(product._id);

      // should validate variants if they exist to determine if product is Valid
      // if variants do not exist then validation should pass
      let isValid;
      if (variants.length !== 0) {
        const validatedVariants = variants.map((variant) => this.validation.validate(variant));
        ([{ isValid }] = validatedVariants);
      } else {
        isValid = true;
      }

      this.setState({
        validProduct: Object.assign({}, product, { __isValid: isValid })
      });
    }

    render() {
      const { isSelected, product } = this.props;

      return (
        <Comp
          product={this.state.validProduct}
          hasCreateProductPermission={Reaction.hasPermission("createProduct")}
          hasChanges={!!product.__draft}
          isSelected={isSelected}
        />
      );
    }
  }
);

/**
 * @summary Composer function
 * @param {Object} props Props from parent
 * @param {Function} onData Callback to pass more props
 * @returns {undefined}
 */
function composer(props, onData) {
  const { product } = props;
  let isSelected = false;

  if (product) {
    const selectedProducts = Session.get("productGrid/selectedProducts");
    isSelected = Array.isArray(selectedProducts) ? selectedProducts.indexOf(product._id) >= 0 : false;
  }

  onData(null, {
    isSelected,
    product
  });
}

registerComponent("GridItemControls", GridItemControls, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(GridItemControls);

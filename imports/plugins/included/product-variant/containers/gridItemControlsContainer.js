import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Validation } from "@reactioncommerce/reaction-collections";
import { Reaction } from "/client/api";
import GridItemControls from "../components/gridItemControls";
import { ReactionProduct } from "/lib/api";
import { ProductVariant } from "/lib/collections/schemas/products";

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

      this.hasCreateProductPermission = this.hasCreateProductPermission.bind(this);
      this.hasChanges = this.hasChanges.bind(this);
      this.checked = this.checked.bind(this);
      this.checkValidation = this.checkValidation.bind(this);
    }

    componentWillMount() {
      this.checkValidation();
    }

    hasCreateProductPermission = () => Reaction.hasPermission("createProduct")

    hasChanges = () => !!this.props.product.__draft

    // This method checks validation of the variants of the all the products on the Products grid to
    // check whether all required fields have been submitted before publishing
    checkValidation = () => {
      // this returns an array with a single object
      const variants = ReactionProduct.getVariants(this.props.product._id);

      // should validate variants if they exist to determine if product is Valid
      if (variants.length !== 0) {
        const validatedVariants = variants.map((variant) => this.validation.validate(variant));
        this.setState({
          validProduct: Object.assign({}, this.props.product, { __isValid: validatedVariants[0].isValid })
        });
      } else {
        // if variants do not exist then validation should pass
        this.setState({
          validProduct: Object.assign({}, this.props.product, { __isValid: true })
        });
      }
    }

    checked = () => this.props.isSelected === true

    render() {
      return (
        <Comp
          product={this.state.validProduct}
          hasCreateProductPermission={this.hasCreateProductPermission}
          hasChanges={this.hasChanges}
          checked={this.checked}
        />
      );
    }
  }
);

function composer(props, onData) {
  const { product } = props;
  let isSelected;

  if (product) {
    const selectedProducts = Session.get("productGrid/selectedProducts");
    isSelected = Array.isArray(selectedProducts) ? selectedProducts.indexOf(product._id) >= 0 : false;
  }

  onData(null, {
    product,
    isSelected
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import GridItemControls from "../components/gridItemControls";

const wrapComponent = (Comp) => (
  class GridItemControlsContainer extends Component {
    static propTypes = {
      isSelected: PropTypes.bool,
      product: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.hasCreateProductPermission = this.hasCreateProductPermission.bind(this);
      this.hasChanges = this.hasChanges.bind(this);
      this.checked = this.checked.bind(this);
      this.checkLabelValidation = this.checkLabelValidation.bind(this);
    }

    hasCreateProductPermission = () => {
      return Reaction.hasPermission("createProduct");
    }

    hasChanges = () => {
      return this.props.product.__draft ? true : false;
    }

    checked = () => {
      return this.props.isSelected === true;
    }

    // checks whether the product variant has a Label
    checkLabelValidation = () => {
      const variants = ReactionProduct.getVariants(this.props.product._id);
      const noLabel = variants.filter((variant) => {
        return variant.title.length === 0;
      });

      return noLabel;
    }

    render() {
      return (
        <Comp
          product={this.props.product}
          hasCreateProductPermission={this.hasCreateProductPermission}
          hasChanges={this.hasChanges}
          checked={this.checked}
          checkLabelValidation={this.checkLabelValidation}
        />
      );
    }
  }
);

function composer(props, onData) {
  const product = props.product;
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

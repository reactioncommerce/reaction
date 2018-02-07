import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { ReactionProduct } from "/lib/api";
import GridItemNotice from "../components/gridItemNotice";

const wrapComponent = (Comp) => (
  class GridItemNoticeContainer extends Component {
    static propTypes = {
      product: PropTypes.object
    }

    constructor() {
      super();

      this.isLowQuantity = this.isLowQuantity.bind(this);
      this.isSoldOut = this.isSoldOut.bind(this);
      this.isBackorder = this.isBackorder.bind(this);
    }

    isLowQuantity = () => {
      const topVariants = ReactionProduct.getTopVariants(this.props.product._id);

      for (const topVariant of topVariants) {
        const inventoryThreshold = topVariant.lowInventoryWarningThreshold;
        const inventoryQuantity = ReactionProduct.getVariantQuantity(topVariant);

        if (inventoryQuantity !== 0 && inventoryThreshold >= inventoryQuantity) {
          return true;
        }
      }
      return false;
    }

    isSoldOut = () => {
      const topVariants = ReactionProduct.getTopVariants(this.props.product._id);

      for (const topVariant of topVariants) {
        const inventoryQuantity = ReactionProduct.getVariantQuantity(topVariant);

        if (inventoryQuantity > 0) {
          return false;
        }
      }
      return true;
    }

    isBackorder = () => this.props.product.isBackorder

    render() {
      return (
        <Comp
          isLowQuantity={this.isLowQuantity}
          isSoldOut={this.isSoldOut}
          isBackorder={this.isBackorder}
        />
      );
    }
  }
);

registerComponent("GridItemNotice", GridItemNotice, wrapComponent);

export default wrapComponent(GridItemNotice);

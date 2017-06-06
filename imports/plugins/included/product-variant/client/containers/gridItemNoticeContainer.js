import React, { Component, PropTypes } from "react";
import { ReactionProduct } from "/lib/api";
import { composeWithTracker } from "/lib/api/compose";
import GridItemNotice from "../components/gridItemNotice";

class GridItemNoticeController extends Component {
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

  isBackorder = () => {
    return this.props.product.isBackorder;
  }

  render() {
    return (
      <GridItemNotice
        isLowQuantity={this.isLowQuantity}
        isSoldOut={this.isSoldOut}
        isBackorder={this.isBackorder}
      />
    );
  }
}

function composer(props, onData) {
  const product = props.product;

  onData(null, {
    product
  });
}

export default composeWithTracker(composer)(GridItemNoticeController);

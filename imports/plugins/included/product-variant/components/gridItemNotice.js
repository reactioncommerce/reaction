import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";

class GridItemNotice extends Component {
  static propTypes = {
    isBackorder: PropTypes.bool,
    isLowQuantity: PropTypes.bool,
    isSoldOut: PropTypes.bool
  }

  renderNotice() {
    if (this.props.isSoldOut) {
      if (this.props.isBackorder) {
        return (
          <span className="variant-qty-sold-out badge">
            <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
          </span>
        );
      }
      return (
        <span className="variant-qty-sold-out badge badge-danger">
          <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
        </span>
      );
    } else if (this.props.isLowQuantity) {
      return (
        <div className="badge badge-low-inv-warning" title="">
          <Components.Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
        </div>
      );
    }
  }
  render() {
    return (
      <div className="product-grid-badges">
        {this.renderNotice()}
      </div>
    );
  }
}

registerComponent("GridItemNotice", GridItemNotice);
export default GridItemNotice;

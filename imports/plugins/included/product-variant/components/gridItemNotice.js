import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class GridItemNotice extends Component {
  static propTypes = {
    isBackorder: PropTypes.func,
    isLowQuantity: PropTypes.func,
    isSoldOut: PropTypes.func
  }

  renderNotice() {
    if (this.props.isSoldOut()) {
      if (this.props.isBackorder()) {
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
    } else if (this.props.isLowQuantity()) {
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

export default GridItemNotice;

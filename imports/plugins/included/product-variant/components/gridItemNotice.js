import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "@reactioncommerce/reaction-ui";

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
            <Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
          </span>
        );
      }
      return (
        <span className="variant-qty-sold-out badge badge-danger">
          <Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
        </span>
      );
    } else if (this.props.isLowQuantity()) {
      return (
        <div className="badge badge-low-inv-warning" title="">
          <Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
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

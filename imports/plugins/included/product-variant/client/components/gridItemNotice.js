import React, { Component, PropTypes } from "react";

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
          <span className="variant-qty-sold-out badge" data-i18n="productDetail.backOrder">Backorder</span>
        );
      }
      return (
        <span className="variant-qty-sold-out badge badge-danger" data-i18n="productDetail.soldOut">Sold Out!</span>
      );
    } else if (this.props.isLowQuantity()) {
      return (
        <div className="badge badge-low-inv-warning" title="" data-i18n="productDetail.limitedSupply">Limited Supply</div>
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

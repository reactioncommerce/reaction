import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { formatPriceString } from "/client/api";

class ProductGridItems extends Component {
  static propTypes = {
    displayPrice: PropTypes.func,
    isSearch: PropTypes.bool,
    isSelected: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    pdpPath: PropTypes.func,
    product: PropTypes.object,
    productMedia: PropTypes.object
  }

  static defaultProps = {
    onClick() {},
    onDoubleClick() {},
    productMedia: {
      additionalMedia: null,
      primaryMedia: null
    }
  };

  handleDoubleClick = (event) => {
    this.props.onDoubleClick(event);
  }

  handleClick = (event) => {
    this.props.onClick(event);
  }

  renderVisible() {
    return this.props.product.isVisible ? "" : "not-visible";
  }

  renderOverlay() {
    if (this.props.product.isVisible === false) {
      return (
        <div className="product-grid-overlay" />
      );
    }
    return null;
  }

  renderMedia() {
    const { product, productMedia } = this.props;

    return (
      <Components.ProductImage displayMedia={() => productMedia.primaryMedia} item={product} size="large" mode="span" />
    );
  }

  renderNotices() {
    const { product } = this.props;

    return (
      <div className="grid-alerts">
        <Components.GridItemNotice product={product} />
        <Components.GridItemControls product={product} />
      </div>
    );
  }

  renderGridContent() {
    return (
      <div className="grid-content">
        <a
          href={this.props.pdpPath()}
          data-event-category="grid"
          data-event-action="product-click"
          data-event-label="grid product click"
          data-event-value={this.props.product._id}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
        >
          <div className="overlay">
            <div className="overlay-title">{this.props.product.title}</div>
            <div className="currency-symbol">{formatPriceString(this.props.displayPrice())}</div>
            {this.props.isSearch &&
                <div className="overlay-description">{this.props.product.description}</div>
            }
          </div>
        </a>
      </div>
    );
  }

  render() {
    const { isSearch, isSelected, pdpPath, product } = this.props;

    const productItem = (
      <li
        className={`product-grid-item product-small ${isSelected() ? "active" : ""}`}
        data-id={product._id}
        id={product._id}
      >
        <div className={isSearch ? "item-content" : ""}>
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={pdpPath()}
            data-event-category="grid"
            data-event-label="grid product click"
            data-event-value={product._id}
            onDoubleClick={this.handleDoubleClick}
            onClick={this.handleClick}
          >
            <div className={`product-primary-images ${this.renderVisible()}`}>
              {this.renderMedia()}
              {this.renderOverlay()}
            </div>
          </a>

          {!isSearch && this.renderNotices()}
          {this.renderGridContent()}
        </div>
      </li>
    );

    return productItem;
  }
}

export default ProductGridItems;

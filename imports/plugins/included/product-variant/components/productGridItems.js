import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { formatPriceString } from "/client/api";

class ProductGridItems extends Component {
  static propTypes = {
    canEdit: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    displayPrice: PropTypes.func,
    isMediumWeight: PropTypes.func,
    isSearch: PropTypes.bool,
    isSelected: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    pdpPath: PropTypes.func,
    positions: PropTypes.func,
    product: PropTypes.object,
    productMedia: PropTypes.object,
    weightClass: PropTypes.func
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

  renderPinned() {
    return this.props.positions().pinned ? "pinned" : "";
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
  }

  renderMedia() {
    const { product, productMedia } = this.props;

    return (
      <Components.ProductImage displayMedia={() => productMedia.primaryMedia} item={product} size="large" mode="span" />
    );
  }

  renderAdditionalMedia() {
    const { isMediumWeight, productMedia } = this.props;
    if (!isMediumWeight()) return null;

    const mediaArray = productMedia.additionalMedia;
    if (!mediaArray || mediaArray.length === 0) return null;

    return (
      <div className={`product-additional-images ${this.renderVisible()}`}>
        {mediaArray.map((media) => (
          <span
            key={media._id}
            className="product-image"
            style={{ backgroundImage: `url('${media.url({ store: "medium" })}')` }}
          />
        ))}
        {this.renderOverlay()}
      </div>
    );
  }

  renderNotices() {
    return (
      <div className="grid-alerts">
        <Components.GridItemNotice product={this.props.product} />
        <Components.GridItemControls product={this.props.product} />
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

  renderHoverClassName() {
    return this.props.isSearch ? "item-content" : "";
  }

  render() {
    const productItem = (
      <li
        className={`product-grid-item ${this.renderPinned()} ${this.props.weightClass()} ${this.props.isSelected()}`}
        data-id={this.props.product._id}
        id={this.props.product._id}
      >
        <div className={this.renderHoverClassName()}>
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={this.props.pdpPath()}
            data-event-category="grid"
            data-event-label="grid product click"
            data-event-value={this.props.product._id}
            onDoubleClick={this.handleDoubleClick}
            onClick={this.handleClick}
          >
            <div className={`product-primary-images ${this.renderVisible()}`}>
              {this.renderMedia()}
              {this.renderOverlay()}
            </div>

            {this.renderAdditionalMedia()}
          </a>

          {!this.props.isSearch && this.renderNotices()}
          {this.renderGridContent()}
        </div>
      </li>
    );

    if (this.props.canEdit) {
      return (
        this.props.connectDropTarget(this.props.connectDragSource(productItem))
      );
    }

    return productItem;
  }
}

export default ProductGridItems;

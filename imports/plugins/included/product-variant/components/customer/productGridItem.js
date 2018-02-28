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

  handleDoubleClick = (event) => {
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(event);
    }
  }

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
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
    return null
    // return (
    //   <div className="grid-alerts">
    //     <GridItemNotice isSoldOut={() => this.props.product.isSoldOut} />

    //   </div>

    // );
  }

  renderGridContent() {
    const { product } = this.props;

    return (
      <div className="grid-content">
        <a
          // href={this.props.pdpPath()}
          href={`product/${product._id}`}
          data-event-category="grid"
          data-event-action="product-click"
          data-event-label="grid product click"
          data-event-value={this.props.product._id}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
        >
          <div className="overlay">
            <div className="overlay-title">{product.title}</div>
            <div className="currency-symbol">{formatPriceString(product.price.range)}</div>
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
    const { product } = this.props;
    const MEDIA_PLACEHOLDER = "/resources/placeholder.gif";

    // TODO: use this to get product url
    // Reaction.Router.pathFor("product", {
    //   hash: {
    //     handle
    //   }
    // });

    // TODO: isSelected is not needed. Others may not need to be functions
    // ${this.renderPinned()} ${this.props.weightClass()} ${this.props.isSelected()}

    const { url } = (Array.isArray(product.media) && product.media[0]) || { url: MEDIA_PLACEHOLDER };
    return (
      <li
        className={`product-grid-item `}
        data-id={this.props.product._id}
        id={this.props.product._id}
      >
        <div className={this.renderHoverClassName()}>
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={`product/${product._id}`}
            data-event-category="grid"
            data-event-label="grid product click"
            data-event-value={this.props.product._id}
            onDoubleClick={this.handleDoubleClick}
            onClick={this.handleClick}
          >
            <div className={`product-primary-images`}>
              <span
                className="product-image"
                style={{ backgroundImage: `url('${url}')` }}
              />
              {/* {this.renderMedia()} */}
              {/* {this.renderOverlay()} */}
            </div>

            {/* {this.renderAdditionalMedia()} */}
          </a>

          {/* {!this.props.isSearch && this.renderNotices()} */}
          {this.renderGridContent()}
        </div>
      </li>
    );
  }
}

export default ProductGridItems;

import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString, Reaction } from "/client/api";

class ProductGridItems extends Component {
  static propTypes = {
    displayPrice: PropTypes.func,
    isMediumWeight: PropTypes.func,
    isSearch: PropTypes.bool,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    positions: PropTypes.func,
    product: PropTypes.object,
    weightClass: PropTypes.func
  }

  // action event handlers
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

  // modifiers
  renderPinned() {
    return this.props.positions().pinned ? "pinned" : "";
  }

  renderVisible() {
    return this.props.product.isVisible ? "" : "not-visible";
  }

   // render class names
  renderHoverClassName() {
    return this.props.isSearch ? "item-content" : "";
  }

  renderOverlay() {
    if (this.props.product.isVisible === false) {
      return (
        <div className="product-grid-overlay" />
      );
    }
  }

  // notice
  renderNotices() {
    return null;
    // return (
    //   <div className="grid-alerts">
    //     <GridItemNotice isSoldOut={() => this.props.product.isSoldOut} />

    //   </div>

    // );
  }

  // getters

  // get product detail page URL
  get productURL() {
    const { product: { handle } } = this.props;
    return Reaction.Router.pathFor("product", {
      hash: {
        handle
      }
    });
  }

  // render product image
  renderMedia() {
    const { product } = this.props;
    const MEDIA_PLACEHOLDER = "/resources/placeholder.gif";
    const { large } = (Array.isArray(product.media) && product.media[0]) || { large: MEDIA_PLACEHOLDER };

    return (
      <span
        className="product-image"
        style={{ backgroundImage: `url(${large})` }}
      />
    );
  }


  renderAdditionalMedia() {
    // const { isMediumWeight, productMedia } = this.props;
    // if (!isMediumWeight()) return null;

    // const mediaArray = productMedia.additionalMedia;
    // if (!mediaArray || mediaArray.length === 0) return null;

    // return (
    //   <div className={`product-additional-images ${this.renderVisible()}`}>
    //     {mediaArray.map((media) => (
    //       <span
    //         key={media._id}
    //         className="product-image"
    //         style={{ backgroundImage: `url('${media.url({ store: "medium" })}')` }}
    //       />
    //     ))}
    //     {this.renderOverlay()}
    //   </div>
    // );
  }

  renderGridContent() {
    const { product } = this.props;

    return (
      <div className="grid-content">
        <a
          href={this.productURL}
          data-event-category="grid"
          data-event-action="product-click"
          data-event-label="grid product click"
          data-event-value={product._id}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
        >
          <div className="overlay">
            <div className="overlay-title">{product.title}</div>
            <div className="currency-symbol">{formatPriceString(product.price.range)}</div>
            {this.props.isSearch &&
                <div className="overlay-description">{product.description}</div>
            }
          </div>
        </a>
      </div>
    );
  }

  render() {
    const { product } = this.props;

    // TODO: isSelected is not needed. Others may not need to be functions
    // ${this.renderPinned()} ${this.props.weightClass()} ${this.props.isSelected()}


    return (
      <li
        className={`product-grid-item `}
        data-id={product._id}
        id={product._id}
      >
        <div className={this.renderHoverClassName()}>
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={this.productURL}
            data-event-category="grid"
            data-event-label="grid product click"
            data-event-value={product._id}
            onDoubleClick={this.handleDoubleClick}
            onClick={this.handleClick}
          >
            <div className="product-primary-images">
              {this.renderMedia()}
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

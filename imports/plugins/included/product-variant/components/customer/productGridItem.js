import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { formatPriceString, Router } from "/client/api";

class ProductGridItem extends Component {
  static propTypes = {
    displayPrice: PropTypes.func,
    isMediumWeight: PropTypes.func,
    isSearch: PropTypes.bool,
    position: PropTypes.object,
    product: PropTypes.object,
    weightClass: PropTypes.func
  }

  // getters

  // get product detail page URL
  get productURL() {
    const { product: { handle } } = this.props;
    return Router.pathFor("product", {
      hash: {
        handle
      }
    });
  }

  // get weight class name
  get weightClass() {
    const { weight } = this.props.position || { weight: 0 };
    switch (weight) {
    case 1:
      return "product-medium";
    case 2:
      return "product-large";
    default:
      return "product-small";
    }
  }

  // get product item class names
  get productClassNames() {
    const { position } = this.props;
    return classnames({
      "product-grid-item": true,
      [this.weightClass]: true,
      "pinned": position.pinned
    });
  }

  renderOverlay() {
    if (this.props.product.isVisible === false) {
      return (
        <div className="product-grid-overlay" />
      );
    }
  }

  handleClick = (event) => {
    event.preventDefault();
    Router.go(this.productURL);
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
    const { product, isSearch } = this.props;
    return (
      <li
        className={this.productClassNames}
        data-id={product._id}
        id={product._id}
      >
        <div className={(isSearch) ? "item-content" : ""}>
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

export default ProductGridItem;

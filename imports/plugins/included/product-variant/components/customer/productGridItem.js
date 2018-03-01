import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { formatPriceString, Router } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

class ProductGridItem extends Component {
  static propTypes = {
    isSearch: PropTypes.bool,
    position: PropTypes.object,
    product: PropTypes.object
  }

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

  // handle click event
  handleClick = (event) => {
    event.preventDefault();
    Router.go(this.productURL);
  }

  // notice
  renderNotices() {
    const { isSoldOut, isLowQuantity, isBackorder } = this.props.product;
    let noticeEl;
    // TODO: revisit this if statement and jsx
    if (isSoldOut) {
      if (isBackorder) {
        noticeEl = (
          <span className="variant-qty-sold-out badge">
            <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
          </span>
        );
      } else {
        noticeEl = (
          <span className="variant-qty-sold-out badge badge-danger">
            <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }
    } else if (isLowQuantity) {
      noticeEl = (
        <span className="badge badge-low-inv-warning">
          <Components.Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
        </span>
      );
    }

    return (
      <div className="grid-alerts">
        <div className="product-grid-badges">
          {noticeEl}
        </div>
      </div>
    );
  }

  // render product image
  renderMedia() {
    const { product } = this.props;
    const MEDIA_PLACEHOLDER = "/resources/placeholder.gif";
    const { large } = (Array.isArray(product.media) && product.media[0]) || { large: MEDIA_PLACEHOLDER };

    return (
      <span
        className="product-image"
        style={{ backgroundImage: `url("${large}")` }}
      />
    );
  }


  renderAdditionalMedia() {
    const { product: { media }, position: { weight } } = this.props;

    // if product is not medium weight
    // or the media object is empty exit
    if (weight !== 1 || (!media || media.length === 0)) return;

    // removing the first image in the media array
    // since it's being used as the primary product image
    const additionalMedia = [...media.slice(1)];

    return (
      <div className="product-additional-images">
        {additionalMedia.map((img) => (
          <span
            key={img.small}
            className="product-image"
            style={{ backgroundImage: `url("${img.medium}")` }}
          />
        ))}
      </div>
    );
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
            onClick={this.handleClick}
          >
            <div className="product-primary-images">
              {this.renderMedia()}
            </div>

            {this.renderAdditionalMedia()}
          </a>

          {!isSearch && this.renderNotices()}
          {this.renderGridContent()}
        </div>
      </li>
    );
  }
}

export default ProductGridItem;

import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { formatPriceString, Router } from "/client/api";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";

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

  // get notice class names
  get noticeClassNames() {
    const { product: { isSoldOut, isLowQuantity, isBackorder } } = this.props;
    return classnames({
      "badge": (isSoldOut || isLowQuantity),
      "variant-qty-sold-out": (isSoldOut || (isSoldOut && isBackorder)),
      "badge-danger": (isSoldOut && !isBackorder),
      "badge-low-inv-warning": (isLowQuantity && !isSoldOut)
    });
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
    const { product: { isSoldOut, isLowQuantity, isBackorder } } = this.props;
    const noticeContent = { classNames: this.noticeClassNames };

    if (isSoldOut) {
      if (isBackorder) {
        noticeContent.defaultValue = "Backorder";
        noticeContent.i18nKey = "productDetail.backOrder";
      } else {
        noticeContent.defaultValue = "Sold Out!";
        noticeContent.i18nKey = "productDetail.soldOut";
      }
    } else if (isLowQuantity) {
      noticeContent.defaultValue = "Limited Supply";
      noticeContent.i18nKey = "productDetail.limitedSupply";
    }

    return (
      <div className="grid-alerts">
        <div className="product-grid-badges">
          <span className={noticeContent.classNames}>
            <Components.Translation defaultValue={noticeContent.defaultValue} i18nKey={noticeContent.i18nKey} />
          </span>
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
    // or the media array is empty exit
    if (weight !== 1 || (!media || media.length === 0)) return;

    // creating an additional madia array with
    // the 2nd, 3rd and 4th images returned
    // in the media array
    const additionalMedia = [...media.slice(1, 4)];

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
            <div className="currency-symbol">{formatPriceString((product.price && product.price.range) || "")}</div>
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


registerComponent("ProductGridItemCustomer", ProductGridItem);

export default ProductGridItem;

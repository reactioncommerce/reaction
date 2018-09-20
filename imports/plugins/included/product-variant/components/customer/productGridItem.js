import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Router } from "/client/api";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";

class ProductGridItem extends Component {
  static propTypes = {
    product: PropTypes.shape({
      _id: PropTypes.string,
      description: PropTypes.string,
      isBackorder: PropTypes.bool,
      isLowQuantity: PropTypes.bool,
      isSoldOut: PropTypes.bool,
      media: PropTypes.arrayOf(PropTypes.object),
      pricing: PropTypes.arrayOf(PropTypes.shape({
        currency: PropTypes.shape({
          code: PropTypes.string
        }),
        displayPrice: PropTypes.string
      })),
      primaryImage: PropTypes.object,
      slug: PropTypes.string,
      title: PropTypes.string
    }),
    shopCurrencyCode: PropTypes.string.isRequired
  }

  // get product detail page URL
  get productURL() {
    const { product: { slug } } = this.props;
    return Router.pathFor("product", {
      hash: {
        handle: slug
      }
    });
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
    const { primaryImage } = product || {};
    const MEDIA_PLACEHOLDER = "/resources/placeholder.gif";
    const { large } = (primaryImage && primaryImage.URLs) || { large: MEDIA_PLACEHOLDER };

    return (
      <span
        className="product-image"
        style={{ backgroundImage: `url("${large}")` }}
      />
    );
  }

  renderGridContent() {
    const { product, shopCurrencyCode } = this.props;
    const pricing = product.pricing.find((price) => price.currency.code === shopCurrencyCode);
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
            <div className="currency-symbol">{pricing.displayPrice}</div>
          </div>
        </a>
      </div>
    );
  }

  render() {
    const { product } = this.props;
    return (
      <li
        className="product-grid-item product-small"
        data-id={product._id}
        id={product._id}
      >
        <div>
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
          </a>

          {this.renderNotices()}
          {this.renderGridContent()}
        </div>
      </li>
    );
  }
}


registerComponent("ProductGridItemCustomer", ProductGridItem);

export default ProductGridItem;

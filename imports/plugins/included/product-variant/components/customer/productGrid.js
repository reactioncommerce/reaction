import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CatalogGrid from "@reactioncommerce/components/CatalogGrid/v1";
import { i18next } from "/client/api";
import trackProductClicked from "/imports/plugins/core/ui/client/tracking/trackProductClicked";
import trackProductListViewed from "/imports/plugins/core/ui/client/tracking/trackProductListViewed";

class ProductGrid extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    shopCurrencyCode: PropTypes.string.isRequired,
    tag: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    })
  }

  componentDidMount() {
    this.trackListViewed();
    window.addEventListener("scroll", this.loadMoreProducts);
  }

  componentDidUpdate() {
    this.trackListViewed();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.loadMoreProducts);
  }

  trackListViewed = () => {
    const { tracking, products, tag } = this.props;

    if (Array.isArray(products) && products.length) {
      trackProductListViewed(tracking, { products, tag });
    }
  };

  // Load more products when user is close (80%) to the bottom
  loadMoreProducts = (event) => {
    const { canLoadMoreProducts, loadProducts } = this.props;
    const { documentElement } = document;
    const { scrollTop, scrollHeight, clientHeight } = documentElement;
    const scrollPercent = (scrollTop) / (scrollHeight - clientHeight) * 100;
    const isCloseToBottom = scrollPercent >= 80;
    if (canLoadMoreProducts && isCloseToBottom) {
      loadProducts(event);
    }
  }

  // render the loading spinner
  renderLoadingSpinner() {
    const { isLoading } = this.props;
    // if the products catalog is not ready
    // show the loading spinner
    if (isLoading) return <Components.Loading />;

    return null;
  }

  // render the No Products Found message
  renderNotFound() {
    const { products, isLoading } = this.props;
    // if the products subscription is ready & the products array is undefined or empty
    // show the Not Found message
    if (isLoading === false && (!Array.isArray(products) || !products.length)) {
      return (
        <Components.NotFound
          i18nKeyTitle="productGrid.noProductsFound"
          icon="fa fa-barcode"
          title="No Products Found"
        />
      );
    }

    return null;
  }

  onItemClick = (event, product) => {
    const { tracking } = this.props;
    trackProductClicked(tracking, product);
  };

  // render the product grid
  renderProductGrid() {
    const { products, shopCurrencyCode } = this.props;
    const badgeLabels = {
      BACKORDER: i18next.t("productDetail.backOrder", "Backorder"),
      LOW_QUANTITY: i18next.t("productDetail.limitedSupply", "Limited Supply"),
      SOLD_OUT: i18next.t("productDetail.soldOut", "Sold Out!")
    };

    return (
      <div className="product-grid">
        <ul className="product-grid-list list-unstyled" id="product-grid-list">
          <CatalogGrid
            currencyCode={shopCurrencyCode}
            products={products}
            badgeLabels={badgeLabels}
            onItemClick={this.onItemClick}
          />
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className="container-grid">
        {this.renderProductGrid()}
        {this.renderLoadingSpinner()}
        {this.renderNotFound()}
      </div>
    );
  }
}

export default ProductGrid;

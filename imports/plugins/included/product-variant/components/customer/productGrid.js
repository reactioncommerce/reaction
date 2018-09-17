import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ProductGrid extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    shopCurrencyCode: PropTypes.string.isRequired
  }

  componentDidMount() {
    window.addEventListener("scroll", this.loadMoreProducts);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.loadMoreProducts);
  }

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

  // render the product grid
  renderProductGrid() {
    const { products, shopCurrencyCode } = this.props;

    return (
      <div className="product-grid">
        <ul className="product-grid-list list-unstyled" id="product-grid-list">
          {products.map((product) => (
            <Components.ProductGridItemCustomer
              shopCurrencyCode={shopCurrencyCode}
              product={product}
              key={product._id}
            />
          ))}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className="container-main">
        {this.renderProductGrid()}
        {this.renderLoadingSpinner()}
        {this.renderNotFound()}
      </div>
    );
  }
}

export default ProductGrid;

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { ReactionProduct } from "/lib/api";

class ProductGrid extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    productsSubscription: PropTypes.object
  }

  componentDidMount() {
    window.addEventListener("scroll", this.loadMoreProducts);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.loadMoreProducts);
  }

  // load more products to the grid
  loadMoreProducts = (event) => {
    const { canLoadMoreProducts, loadProducts } = this.props;
    const { scrollY, innerHeight } = window;
    const { body: { scrollHeight } } = document;
    const atBottom = (innerHeight + scrollY === scrollHeight);

    if (canLoadMoreProducts && atBottom) {
      loadProducts(event);
    }
  }

  // render the loading spinner
  renderLoadingSpinner() {
    const { productsSubscription: { ready } } = this.props;
    // if the products catalog is not ready
    // show the loading spinner
    if (!ready()) return <Components.Loading />;
  }

  // render the No Products Found message
  renderNotFound() {
    const { products, productsSubscription: { ready } } = this.props;
    // if the products subscription is ready & the products array is undefined or empty
    // show the Not Found message
    if (ready() && (!Array.isArray(products) || !products.length)) {
      return (
        <Components.NotFound
          i18nKeyTitle="productGrid.noProductsFound"
          icon="fa fa-barcode"
          title="No Products Found"
        />
      );
    }
  }

  // render the product grid
  renderProductGrid() {
    const { products } = this.props;
    const currentTag = ReactionProduct.getTag();

    return (
      <div className="product-grid">
        <ul className="product-grid-list list-unstyled" id="product-grid-list">
          {products.map((product) => (
            <Components.ProductGridItemCustomer
              product={product}
              position={(product.positions && product.positions[currentTag]) || {}}
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

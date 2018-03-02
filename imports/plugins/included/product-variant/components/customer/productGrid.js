import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import ProductGridItem from "./productGridItem";
import { ReactionProduct } from "/lib/api";

class ProductGrid extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    ready: PropTypes.func
  }

  // events

  // load more products to the grid
  loadMoreProducts = (event) => {
    console.log("loading more products");
    this.props.loadProducts(event);
  }

  // render the laoding spinner
  renderLoadingSpinner() {
    return <Components.Loading />;
  }

  // render the No Products Found message
  renderNotFound() {
    return <Components.NotFound i18nKeyTitle="productGrid.noProductsFound" icon="fa fa-barcode" title="No Products Found" />;
  }

  // render the product grid
  renderProductGrid() {
    const { products } = this.props;
    const currentTag = ReactionProduct.getTag();

    return (
      <div className="product-grid">
        <ul className="product-grid-list list-unstyled" id="product-grid-list">
          {products.map((product) => (
            <ProductGridItem
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
    console.log("this.props", this.props);

    const { products, ready } = this.props;
    if (!ready()) return this.renderLoadingSpinner();
    if (!Array.isArray(products) || !products.length) return this.renderNotFound();

    return (
      <div className="container-main">
        {this.renderProductGrid()}
        <button id="productScrollLimitLoader" onClick={this.loadMoreProducts}>Load More Prods</button>
      </div>
    );
  }
}

export default ProductGrid;

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import ProductGridItem from "./productGridItem";
import { ReactionProduct } from "/lib/api";

class ProductGrid extends Component {
  static propTypes = {
    productMediaById: PropTypes.object,
    products: PropTypes.array
  }

  renderProductGridItems() {
    const { products } = this.props;
    const currentTag = ReactionProduct.getTag();

    if (Array.isArray(products)) {
      return products.map((product, index) => (
        <ProductGridItem
          product={product}
          position={(product.positions && product.positions[currentTag]) || {}}
          key={index}
          index={index}
        />
      ));
    }

    return (
      <div className="row">
        <div className="text-center">
          <h3>
            <Components.Translation defaultValue="No Products Found" i18nKey="app.noProductsFound" />
          </h3>
        </div>
      </div>
    );
  }

  render() {
    console.log("this.props", this.props);

    return (
      <div className="container-main">
        <div className="product-grid">
          <ul className="product-grid-list list-unstyled" id="product-grid-list">
            {this.renderProductGridItems()}
          </ul>
        </div>
      </div>
    );
  }
}

export default ProductGrid;

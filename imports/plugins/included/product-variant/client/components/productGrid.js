import React, { Component, PropTypes } from "react";
import ProductGridItemsContainer from "../containers/productGridItemsContainer";

class ProductGrid extends Component {
  static propTypes = {
    products: PropTypes.array
  }

  renderProductGridItems = (products) => {
    if (Array.isArray(products)) {
      return products.map((product, index) => {
        return (
          <ProductGridItemsContainer
            product={product} key={index}
          />
        );
      });
    }
    return null;
  }

  render() {
    return (
      <div className="container-main">
        <div className="product-grid">
          <ul className="product-grid-list list-unstyled" id="product-grid-list">
            {this.renderProductGridItems(this.props.products)}
          </ul>
        </div>
      </div>
    );
  }
}

export default ProductGrid;

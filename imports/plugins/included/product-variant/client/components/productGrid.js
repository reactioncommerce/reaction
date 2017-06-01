import React, { Component, PropTypes } from "react";

class ProductGrid extends Component {
  static propTypes = {
    grid: PropTypes.bool
  }

  render() {
    return (
      <div className="container-main">
        <div className="product-grid">
          <ul className="product-grid-list list-unstyled" id="product-grid-list">
            <li>Test</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default ProductGrid;

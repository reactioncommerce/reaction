import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ProductGrid extends Component {
  static propTypes = {
    canEdit: PropTypes.bool,
    itemSelectHandler: PropTypes.func,
    onMove: PropTypes.func,
    products: PropTypes.array
  }

  renderProductGridItems() {
    const { canEdit, itemSelectHandler, onMove, products } = this.props;
    if (Array.isArray(products)) {
      return products.map((product) => (
        <Components.ProductGridItems
          key={product._id}
          canEdit={canEdit}
          itemSelectHandler={itemSelectHandler}
          onMove={onMove}
          product={product}
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
    return (
      <div className="container-main">
        <div className="product-grid">
          <Components.DragDropProvider>
            <ul className="product-grid-list list-unstyled" id="product-grid-list">
              {this.renderProductGridItems()}
            </ul>
          </Components.DragDropProvider>
        </div>
      </div>
    );
  }
}

export default ProductGrid;

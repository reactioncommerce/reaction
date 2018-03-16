import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ProductGrid extends Component {
  static propTypes = {
    canEdit: PropTypes.bool,
    itemSelectHandler: PropTypes.func,
    onMove: PropTypes.func,
    productMediaById: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object)
  }

  renderProductGridItems() {
    const { canEdit, itemSelectHandler, onMove, products, productMediaById } = this.props;
    if (Array.isArray(products)) {
      return products.map((product) => (
        <Components.ProductGridItems
          key={product._id}
          canEdit={canEdit}
          itemSelectHandler={itemSelectHandler}
          onMove={onMove}
          product={product}
          productMedia={productMediaById[product._id]}
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

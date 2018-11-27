/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";

class ProductGrid extends Component {
  static propTypes = {
    productMediaById: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    productMediaById: {}
  };

  onPageClick = (event) => {
    // Do nothing if we are in preview mode
    if (Reaction.isPreview() === false) {
      // Don't trigger the clear selection if we're clicking on a grid item.
      if (event.target.closest(".product-grid-item") === null) {
        const selectedProducts = Session.get("productGrid/selectedProducts");

        // Do we have any selected products?
        // If we do then lets reset the Grid Settings ActionView
        if (Array.isArray(selectedProducts) && selectedProducts.length) {
          // Reset sessions ver of selected products
          Session.set("productGrid/selectedProducts", []);
        }
      }
    }
  }

  renderProductGridItems() {
    const { productMediaById, products } = this.props;

    if (Array.isArray(products) && products.length > 0) {
      return products.map((product, index) => (
        <Components.ProductGridItems
          {...this.props}
          product={product}
          productMedia={productMediaById[product._id]}
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
    return (
      <div className="container-main" onClick={this.onPageClick}>
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

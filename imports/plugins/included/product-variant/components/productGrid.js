import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "@reactioncommerce/reaction-ui";
import ProductGridItemsContainer from "../containers/productGridItemsContainer";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

class ProductGrid extends Component {
  static propTypes = {
    products: PropTypes.array
  }

  renderProductGridItems = (products) => {
    if (Array.isArray(products)) {
      return products.map((product, index) => {
        return (
          <ProductGridItemsContainer
            {...this.props}
            product={product} key={index} index={index}
          />
        );
      });
    }
    return (
      <div className="row">
        <div className="text-center">
          <h3>
            <Translation defaultValue="No Products Found" i18nKey="app.noProductsFound" />
          </h3>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container-main">
        <div className="product-grid">
          <DragDropProvider>
            <ul className="product-grid-list list-unstyled" id="product-grid-list">
              {this.renderProductGridItems(this.props.products)}
            </ul>
          </DragDropProvider>
        </div>
      </div>
    );
  }
}

export default ProductGrid;

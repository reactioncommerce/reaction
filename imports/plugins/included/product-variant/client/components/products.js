import React from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { getTagIds as getIds } from "/lib/selectors/tags";
import ProductGridContainer from "../containers/productGridContainer";

class ProductsComponent extends React.Component {

  static propTypes = {
    products: PropTypes.array,
    productsSubscription: PropTypes.object,
    ready: PropTypes.func
  };

  renderProductGrid() {
    const products = this.props.products;

    const productsByKey = {};

    if (Array.isArray(products)) {
      for (const product of products) {
        productsByKey[product._id] = product;
      }
    }

    return (
      <ProductGridContainer
        productsByKey={productsByKey || {}}
        productIds={getIds({ tags: products })}
        canEdit={Reaction.hasPermission("createProduct")}
        products={products}
      />
    );
  }

  renderSpinner() {
    if (this.props.productsSubscription.ready() === false) {
      return (
        <div className="spinner-container">
          <p>Not Ready</p>
          <div className="spinner" />
        </div>
      );
    }
  }

  render() {
    if (this.props.ready()) {
      return (
        <div>
          {this.renderProductGrid()}
          {this.renderSpinner()}
        </div>
      );
    }
    return (
      <div className="spinner-container spinner-container-lg">
        <p>I'm Not Ready</p>
        <div className="spinner" />
      </div>
    );
  }
}

export default ProductsComponent;

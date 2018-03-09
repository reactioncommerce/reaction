import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { getTagIds as getIds } from "/lib/selectors/tags";

/** Class representing the Products React component
 * @summary PropTypes for Product React component
 * @property {Function} loadMoreProducts - load more products callback
 * @property {Function} loadProducts - Load products callback
 * @property {Array} products - Array of products
 * @property {Object} products - Products subscription
 * @property {Function} ready - Ready state check helper
 * @property {Boolean} showNotFound - Force show not-found view
*/

class Products extends Component {
  static propTypes = {
    loadMoreProducts: PropTypes.func,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    productsSubscription: PropTypes.object,
    ready: PropTypes.func,
    showNotFound: PropTypes.bool
  };

  /**
   * Checks and returns a Boolean if the `products` array from props is not empty.
   * @return {Boolean} Boolean value `true` if products are available, `false` otherwise.
   */
  get hasProducts() {
    return Array.isArray(this.props.products) && this.props.products.length > 0;
  }

  /**
   * Handle load more button click
   * @access protected
   * @param  {SyntheticEvent} event Synthetic event object
   * @return {undefined}
   */
  handleClick = (event) => {
    if (this.props.loadProducts) {
      this.props.loadProducts(event);
    }
  }

  /**
   * Render product grid
   * @access protected
   * @return {Node} React node containing the `ProductGrid` component.
   */
  renderProductGrid() {
    const { products } = this.props;

    const productsByKey = {};

    if (Array.isArray(products)) {
      for (const product of products) {
        productsByKey[product._id] = product;
      }
    }

    return (
      <Components.ProductGrid
        productsByKey={productsByKey || {}}
        productIds={getIds({ tags: products })}
        canEdit={Reaction.hasPermission("createProduct")}
        products={products}
      />
    );
  }

  /**
   * Render loading component
   * @access protected
   * @return {Node} React node containing the `Loading` component.
   */
  renderSpinner() {
    if (this.props.productsSubscription.ready() === false) {
      return (
        <Components.Loading />
      );
    }
  }

  /**
   * Render load more button
   * @access protected
   * @return {Node|undefined} React node contianing a `laod more` button or undefined.
   */
  renderLoadMoreProductsButton() {
    if (this.props.loadMoreProducts()) {
      return (
        <div className="product-load-more" id="productScrollLimitLoader">
          <button
            className="btn btn-inverse btn-block btn-lg"
            onClick={this.handleClick}
          >
            <Components.Translation defaultValue="Load more products" i18nKey="app.loadMoreProducts" />
          </button>
        </div>
      );
    }
  }

  /**
   * Render the not found component
   * @access protected
   * @return {Node} React node contianing the `NotFound` component.
   */
  renderNotFound() {
    return (
      <Components.NotFound
        i18nKeyTitle="productGrid.noProductsFound"
        icon="fa fa-barcode"
        title="No Products Found"
      />
    );
  }

  /**
   * Render component
   * @access protected
   * @return {Node} React node containing elements that make up the `Products` component.
   */
  render() {
    // Force show the not-found view.
    if (this.props.showNotFound) {
      return this.renderNotFound();
    } else if (this.props.ready()) {
      // Render products grid if products are available after subscription ready.
      if (this.hasProducts) {
        return (
          <div id="container-main">
            {this.renderProductGrid()}
            {this.renderLoadMoreProductsButton()}
            {this.renderSpinner()}
          </div>
        );
      }

      // Render not-found view if no products are available.
      return this.renderNotFound();
    }

    // Render loading component by default if no condition above matches.
    return this.renderSpinner();
  }
}

export default Products;

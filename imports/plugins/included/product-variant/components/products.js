import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { getTagIds as getIds } from "/lib/selectors/tags";

/** Class representing the Products React component
 * @summary PropTypes for Product React component
 * @property {Boolean} canLoadMoreProducts - Are there more products to load?
 * @property {Boolean} isProductsSubscriptionReady - Products subscription is ready?
 * @property {Boolean} isReady - Data is ready?
 * @property {Function} loadProducts - Load products callback
 * @property {Array} products - Array of products
 * @property {Boolean} showNotFound - Force show not-found view
*/

class Products extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    files: PropTypes.arrayOf(PropTypes.object),
    handleDelete: PropTypes.func,
    isFiltered: PropTypes.bool,
    isProductsSubscriptionReady: PropTypes.bool,
    isReady: PropTypes.bool,
    loadProducts: PropTypes.func,
    onDisplayTagSelector: PropTypes.func,
    onShowFilterByFile: PropTypes.func,
    products: PropTypes.array,
    setFilteredProductIdsCount: PropTypes.func,
    showNotFound: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
  };

  /**
   * Checks and returns a Boolean if the `products` array from props is not empty.
   * @returns {Boolean} Boolean value `true` if products are available, `false` otherwise.
   */
  get hasProducts() {
    return Array.isArray(this.props.products) && this.props.products.length > 0;
  }

  /**
   * Handle load more button click
   * @access protected
   * @param  {SyntheticEvent} event Synthetic event object
   * @returns {undefined}
   */
  handleClick = (event) => {
    if (this.props.loadProducts) {
      this.props.loadProducts(event);
    }
  }

  /**
   * Render product grid
   * @access protected
   * @returns {Node} React node containing the `ProductGrid` component.
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
        onShowFilterByFile={this.props.onShowFilterByFile}
        onDisplayTagSelector={this.props.onDisplayTagSelector}
        setFilteredProductIdsCount={this.props.setFilteredProductIdsCount}
        productsByKey={productsByKey || {}}
        productIds={getIds({ tags: products })}
        products={products}
        files={this.props.files}
        handleDelete={this.props.handleDelete}
        isFiltered={this.props.isFiltered}
      />
    );
  }

  /**
   * Render load more button
   * @access protected
   * @returns {Node|undefined} React node containing a `load more` button or undefined.
   */
  renderLoadMoreProductsButton() {
    if (this.props.canLoadMoreProducts) {
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

    return null;
  }

  /**
   * Render the not found component
   * @access protected
   * @returns {Node} React node containing the `NotFound` component.
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
   * @returns {Node} React node containing elements that make up the `Products` component.
   */
  render() {
    const { isProductsSubscriptionReady, isReady, showNotFound } = this.props;

    // Force show the not-found view.
    if (showNotFound) {
      return this.renderNotFound();
    }

    if (!isProductsSubscriptionReady || !isReady) {
      return (
        <Components.Loading />
      );
    }

    // Render not-found view if no products are available.
    if (!this.hasProducts) {
      return this.renderNotFound();
    }

    return (
      <div id="container-main">
        {this.renderProductGrid()}
      </div>
    );
  }
}

export default Products;

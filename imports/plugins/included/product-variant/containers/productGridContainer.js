import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Media } from "/imports/plugins/core/files/client";
import { ReactionProduct } from "/lib/api";
import ProductGrid from "../components/productGrid";

const wrapComponent = (Comp) => (
  class ProductGridContainer extends Component {
    static propTypes = {
      isSearch: PropTypes.bool,
      productIds: PropTypes.arrayOf(PropTypes.string),
      products: PropTypes.array,
      productsByKey: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.state = {
        initialLoad: true,
        slug: "",
        canLoadMoreProducts: false
      };
    }

    handleSelectProductItem = (isChecked, productId) => {
      let selectedProducts = Session.get("productGrid/selectedProducts") || [];

      if (isChecked) {
        selectedProducts.push(productId);
        selectedProducts = _.uniq(selectedProducts);
      } else {
        selectedProducts = _.without(selectedProducts, productId);
      }

      // Save the selected items to the Session
      Session.set("productGrid/selectedProducts", selectedProducts);
    }

    get products() {
      const { isSearch, products, productsByKey, productIds } = this.props;
      if (isSearch) {
        return products;
      }
      return productIds.map((id) => productsByKey[id]);
    }

    render() {
      return (
        <Comp
          {...this.props}
          itemSelectHandler={this.handleSelectProductItem}
          products={this.products}
        />
      );
    }
  }
);

/**
 * @name composer
 * @summary Builds productMediaById object and passes to child component
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {undefined}
 */
function composer(props, onData) {
  // Instantiate an object for use as a map. This object does not inherit prototype or methods from `Object`
  const productMediaById = Object.create(null);
  (props.products || []).forEach((product) => {
    const primaryMedia = Media.findOneLocal({
      "metadata.productId": product._id,
      "metadata.toGrid": 1,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    }, {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    const variantIds = ReactionProduct.getVariants(product._id).map((variant) => variant._id);
    let additionalMedia = Media.findLocal({
      "metadata.productId": product._id,
      "metadata.variantId": { $in: variantIds },
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    }, {
      limit: 3,
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    if (additionalMedia.length < 2) additionalMedia = null;

    productMediaById[product._id] = {
      additionalMedia,
      primaryMedia
    };
  });

  onData(null, {
    productMediaById
  });
}

registerComponent("ProductGrid", ProductGrid, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductGrid);

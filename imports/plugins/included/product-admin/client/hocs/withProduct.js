import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { withRouter } from "react-router";
import { Media } from "/imports/plugins/core/files/client";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { getPrimaryMediaForItem, ReactionProduct } from "/lib/api";
import { Tags, Templates } from "/lib/collections";
import { Countries } from "/client/collections";
import { getVariantIds } from "/lib/selectors/variants";

const wrapComponent = (Comp) => (
  class ProductAdminContainer extends Component {
    static propTypes = {
      product: PropTypes.object,
      tags: PropTypes.arrayOf(PropTypes.object)
    }

    constructor(props) {
      super(props);

      this.state = {
        newMetafield: {
          key: "",
          value: ""
        }
      };
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleDeleteProduct = (product) => {
      ReactionProduct.archiveProduct(product || this.product);
    }

    handleProductFieldSave = (productId, fieldName, value) => {
      Meteor.call("products/updateProductField", productId, fieldName, value, (error, result) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        } else if (result.handle) {
          Reaction.Router.go("product", {
            handle: result.handle
          });
        }
      });
    }


    handleMetaChange = (metafield) => {
      const newState = {
        newMetafield: metafield
      };

      this.setState(newState);
    }

    handleMetafieldSave = (productId, metafield, index) => {
      // update existing metafield
      if (index >= 0) {
        Meteor.call("products/updateMetaFields", productId, metafield, index);
      } else if (metafield.key && metafield.value) {
        Meteor.call("products/updateMetaFields", productId, metafield);
      }

      this.setState({
        newMetafield: {
          key: "",
          value: ""
        }
      });
    }

    handleMetaRemove = (productId, metafield) => {
      Meteor.call("products/removeMetaFields", productId, metafield);
    }

    handleProductRestore = (product) => {
      Meteor.call("products/updateProductField", product._id, "isDeleted", false);
    }

    handleCreateVariant = () => {

    }

    render() {
      return (
        <Comp
          newMetafield={this.state.newMetafield}
          onCardExpand={this.handleCardExpand}
          onDeleteProduct={this.handleDeleteProduct}
          onMetaChange={this.handleMetaChange}
          onMetaRemove={this.handleMetaRemove}
          onMetaSave={this.handleMetafieldSave}
          onProductFieldSave={this.handleProductFieldSave}
          onRestoreProduct={this.handleProductRestore}
          onCreateVariant={this.handleCreateVariant}
          {...this.props}
        />
      );
    }
  }
);

/**
 * Get top level variants
 * @returns {Array<Object>} Array of variant objects
 */
function getTopVariants() {
  let inventoryTotal = 0;
  const variants = ReactionProduct.getTopVariants();
  if (variants.length) {
    // calculate inventory total for all variants
    for (const variant of variants) {
      if (variant.inventoryManagement) {
        const qty = variant.inventoryAvailableToSell;
        if (typeof qty === "number") {
          inventoryTotal += qty;
        }
      }
    }
    // calculate percentage of total inventory of this product
    for (const variant of variants) {
      const qty = variant.inventoryAvailableToSell;
      variant.inventoryTotal = inventoryTotal;
      if (variant.inventoryManagement && inventoryTotal) {
        variant.inventoryPercentage = parseInt(qty / inventoryTotal * 100, 10);
      } else {
        // for cases when sellers doesn't use inventory we should always show
        // "green" progress bar
        variant.inventoryPercentage = 100;
      }
      if (variant.title) {
        variant.inventoryWidth = parseInt(variant.inventoryPercentage - variant.title.length, 10);
      } else {
        variant.inventoryWidth = 0;
      }
    }
    // sort variants in correct order
    variants.sort((a, b) => a.index - b.index);

    return variants;
  }
  return [];
}

/**
 * Composer function for product and variant data
 * @param {Object} props Component props to compose
 * @param {onData} onData Data callback
 * @returns {undefined} No return
 */
function composer(props, onData) {
  const { handle: productId, variantId } = props.match.params;
  const editable = Reaction.hasAdminAccess();

  let product;
  let productSub;
  if (productId) {
    productSub = Meteor.subscribe("Product", productId);
    Meteor.subscribe("ProductMedia", productId);
  }

  if (productSub && productSub.ready()) {
    product = ReactionProduct.setProduct(productId, variantId);

    if (variantId) {
      ReactionProduct.setCurrentVariant(variantId);
    }
  }

  let tags;
  let media;
  let revisonDocumentIds;

  if (product) {
    if (_.isArray(product.hashtags)) {
      tags = Tags.find({ _id: { $in: product.hashtags } }).fetch();
    }

    const selectedVariant = ReactionProduct.selectedVariant();

    if (selectedVariant) {
      media = getPrimaryMediaForItem({
        productId: product._id,
        variantId: selectedVariant._id
      });
    }

    revisonDocumentIds = [product._id];

    const templates = Templates.find({
      parser: "react",
      provides: "template",
      templateFor: { $in: ["pdp"] },
      enabled: true
    }).map((template) => ({
      label: template.title,
      value: template.name
    }));

    const countries = Countries.find({}).fetch();

    let variants = getTopVariants();

    if (variants) {
      const variantMedia = Media.findLocal(
        {
          "metadata.variantId": {
            $in: getVariantIds(variants)
          }
        },
        {
          sort: {
            "metadata.priority": 1
          }
        }
      );

      variants = variants.map((variantData) => ({
        ...variantData,
        media: variantMedia && variantMedia.filter((variantMediaItem) => (
          variantMediaItem.metadata.variantId === variantData._id
        ))
      }));
    }


    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails",
      product,
      media,
      tags,
      revisonDocumentIds,
      templates,
      countries,
      editable,
      variants
    });
  } else {
    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails"
    });
  }
}

// Decorate component and export
export default compose(
  withRouter,
  composeWithTracker(composer),
  wrapComponent
);

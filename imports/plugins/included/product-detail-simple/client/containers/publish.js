import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/revisions/client/containers/publishContainer";

class ProductPublishContainer extends Component {
  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = (product) => {
    Meteor.call("products/updateProductField", product._id, "isDeleted", false);
  }

  handleVisibilityChange = (event, isProductVisible) => {
    const { product } = this.props;
    if (!product) return;

    // Update main product
    Meteor.call("products/updateProductField", product._id, "isVisible", isProductVisible);

    const variants = Products.find({
      ancestors: {
        $in: [product._id]
      }
    }).fetch();

    variants.map((variant) =>
      // update variant
      Meteor.call("products/updateProductField", variant._id, "isVisible", isProductVisible));
  }

  handlePublishActions = (event, action, documentIds) => {
    if (action === "archive") {
      ReactionProduct.archiveProduct(documentIds);
    }
  }

  render() {
    return (
      <PublishContainer
        onAction={this.handlePublishActions}
        onVisibilityChange={this.handleVisibilityChange}
        {...this.props}
      />
    );
  }
}


function composer(props, onData) {
  const product = ReactionProduct.selectedProduct();
  let revisonDocumentIds;
  if (product) {
    revisonDocumentIds = [product._id];
    onData(null, {
      product,
      documentIds: revisonDocumentIds,
      documents: [product]
    });
  } else {
    onData(null, {});
  }
}

ProductPublishContainer.propTypes = {
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

registerComponent("ProductPublish", ProductPublishContainer, composeWithTracker(composer));

// Decorate component and export
export default composeWithTracker(composer)(ProductPublishContainer);

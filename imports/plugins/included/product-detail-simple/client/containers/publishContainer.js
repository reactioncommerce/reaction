import React, { Component, PropTypes } from "react";
import update from "react/lib/update";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Tags, Media } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/revisions/client/containers/publishContainer";

class ProductPublishContainer extends Component {
  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = (product) => {
    Meteor.call("products/updateProductField", product._id, "isDeleted", false);
  }

  handleVisibilityChange = (event, isProductVisible) => {
    Meteor.call("products/updateProductField", this.props.product._id, "isVisible", isProductVisible);
  }

  handlePublishActions = (event, action, documentIds) => {
    if (action === "archive") {
      ReactionProduct.maybeDeleteProduct(documentIds);
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
    if (_.isArray(product.hashtags)) {
      tags = _.map(product.hashtags, function (id) {
        return Tags.findOne(id);
      });
    }

    const selectedVariant = ReactionProduct.selectedVariant();

    if (selectedVariant) {
      media = Media.find({
        "metadata.variantId": selectedVariant._id
      }, {
        sort: {
          "metadata.priority": 1
        }
      });
    }

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

// Decorate component and export
export default composeWithTracker(composer)(ProductPublishContainer);

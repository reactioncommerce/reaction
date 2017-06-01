import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Router } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Tags, Media, Products } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/revisions/client/containers/publishContainer";

class ProductPublishContainer extends Component {
  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = (product) => {
    Meteor.call("products/updateProductField", product._id, "isDeleted", false);
  }

  handleVisibilityChange = (event, isProductVisible) => {
    // Update main product
    Meteor.call("products/updateProductField", this.props.product._id, "isVisible", isProductVisible);

    const variants = Products.find({
      ancestors: {
        $in: [this.props.product._id]
      }
    }).fetch();

    variants.map(variant => {
      // update variant
      Meteor.call("products/updateProductField", variant._id, "isVisible", isProductVisible);
    });
  }

  handlePublishActions = (event, action, documentIds) => {
    if (action === "archive") {
      ReactionProduct.archiveProduct(documentIds);
    }
  }

  handlePublishSuccess = (result) => {
    if (result && result.status === "success" && this.props.product) {
      const productDocument = result.previousDocuments.find((product) => this.props.product._id === product._id);

      if (productDocument && this.props.product.handle !== productDocument.handle) {
        const newProductPath = Router.pathFor("product", {
          hash: {
            handle: this.props.product.handle
          }
        });

        window.location.href = newProductPath;
      }
    }
  }

  render() {
    return (
      <PublishContainer
        onAction={this.handlePublishActions}
        onPublishSuccess={this.handlePublishSuccess}
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

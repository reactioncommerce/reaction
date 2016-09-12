import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { ReactionProduct } from "/lib/api";
import { Tags, Media } from "/lib/collections";
import { ProductAdmin } from "../components";

class ProductAdminContainer extends Component {
  render() {
    return (
      <ProductAdmin {...this.props} />
    );
  }
}

function handleProductFieldChange(productId, fieldName, value) {
  Meteor.call("products/updateProductField", productId, fieldName, value);
}

function handleProductMetafieldChange(productId, metafield, index) {
  // update existing metafield
  if (index >= 0) {
    Meteor.call("products/updateMetaFields", productId, metafield, index);
  }

  // Create new meta field
  if (metafield.key && metafield.value) {
    Meteor.call("products/updateMetaFields", productId, metafield);
  }
}

function handleProductMetafieldRemove(productId, metafield) {
  Meteor.call("products/removeMetaFields", productId, metafield);
}

function composer(props, onData) {
  const product = ReactionProduct.selectedProduct();
  let tags;
  let media;
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
  }

  onData(null, {
    product: product,
    media,
    tags,
    revisonDocumentIds,
    handleProductFieldChange,
    handleProductMetafieldChange,
    handleProductMetafieldRemove
  });
}

// Decorate component and export
let decoratedComponent;
decoratedComponent = composeWithTracker(composer)(ProductAdminContainer);

export default decoratedComponent;

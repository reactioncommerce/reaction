import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import PublishContainer from "/imports/plugins/core/revisions/client/containers/publishContainer";

class GridProductPublishContainer extends Component {
  static propTypes = {
    documentIds: PropTypes.arrayOf(PropTypes.string),
    documents: PropTypes.arrayOf(PropTypes.object)
  };

  handleVisibilityChange = (event, isProductVisible) => {
    if (Array.isArray(this.props.documentIds)) {
      for (const productId of this.props.documentIds) {
        Meteor.call("products/updateProductField", productId, "isVisible", isProductVisible);
      }
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "archive") {
      ReactionProduct.archiveProduct(this.props.documents);
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
  const selectedProducts = Session.get("productGrid/selectedProducts");
  const products = Session.get("productGrid/products");

  let productIds;

  if (Array.isArray(selectedProducts) && selectedProducts.length) {
    productIds = selectedProducts;
  } else if (Array.isArray(products) && products.length) {
    productIds = products.map((p) => p._id);
  }

  if (productIds) {
    const documents = Products.find({
      _id: { $in: productIds }
    }).fetch();

    onData(null, {
      documentIds: productIds,
      documents
    });
  } else {
    onData(null, {});
  }
}

registerComponent("GridProductPublish", GridProductPublishContainer, composeWithTracker(composer));

// Decorate component and export
export default composeWithTracker(composer)(GridProductPublishContainer);

import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
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
      ReactionProduct.maybeDeleteProduct(this.props.documents);
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

  if (selectedProducts) {
    const documents = Products.find({
      _id: { $in: selectedProducts }
    }).fetch();

    onData(null, {
      documentIds: selectedProducts,
      documents
    });
  } else {
    onData(null, {});
  }
}

// Decorate component and export
export default composeWithTracker(composer)(GridProductPublishContainer);

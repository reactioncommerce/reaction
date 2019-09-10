import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";
import PublishControls from "../components/publishControls";

/*
 * PublishContainer is a container component connected to Meteor data source.
 */
class PublishContainer extends Component {
  async publishToCatalog(productIds, mutation) {
    // we need to encode the productIds here to pass them to GraphQL
    const productIdObjects = productIds.map((productId) => (
      { namespace: "Product", id: productId }
    ));
    const opaqueProductIds = await getOpaqueIds(productIdObjects);

    await mutation({
      variables: {
        productIds: opaqueProductIds
      }
    });
  }

  handlePublishClick = (mutation) => {
    const productIds = this.props.documents
      .filter((doc) => doc.type === "simple")
      .map((doc) => doc._id);

    this.publishToCatalog(productIds, mutation);
  }

  handlePublishActions = (event, action) => {
    if (action === "archive" && this.props.onAction) {
      this.props.onAction(event, action, this.props.documentIds);
    }
  }

  render() {
    return (
      <TranslationProvider>
        <PublishControls
          documentIds={this.props.documentIds}
          documents={this.props.documents}
          isEnabled={this.props.isEnabled}
          onPublishClick={this.handlePublishClick}
          onAction={this.handlePublishActions}
          onVisibilityChange={this.props.onVisibilityChange}
        />
      </TranslationProvider>
    );
  }
}

PublishContainer.propTypes = {
  documentIds: PropTypes.arrayOf(PropTypes.string),
  documents: PropTypes.arrayOf(PropTypes.object),
  isEnabled: PropTypes.bool,
  onAction: PropTypes.func,
  onPublishSuccess: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  product: PropTypes.object
};

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  if (Array.isArray(props.documentIds) && props.documentIds.length) {
    onData(null, {
      documentIds: props.documentIds,
      documents: props.documents
    });
  }
}

export default composeWithTracker(composer)(PublishContainer);

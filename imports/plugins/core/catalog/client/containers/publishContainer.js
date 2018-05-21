import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import PublishControls from "../components/publishControls";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";
import { Reaction, i18next } from "/client/api";

/*
 * PublishContainer is a container component connected to Meteor data source.
 */
class PublishContainer extends Component {
  publishToCatalog(collection, documentIds) {
    Meteor.call(`catalog/publish/${collection}`, documentIds, (error, result) => {
      if (result) {
        Alerts.toast(i18next.t("admin.catalogProductPublishSuccess", { defaultValue: "Product published to catalog" }), "success");
      } else if (error) {
        Alerts.toast(error.message, "error");
      }
    });
  }

  handlePublishClick = () => {
    const productIds = this.props.documents
      .filter((doc) => doc.type === "simple")
      .map((doc) => doc._id);

    this.publishToCatalog("products", productIds);
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
          isPreview={this.props.isPreview}
        />
      </TranslationProvider>
    );
  }
}

PublishContainer.propTypes = {
  documentIds: PropTypes.arrayOf(PropTypes.string),
  documents: PropTypes.arrayOf(PropTypes.object),
  isEnabled: PropTypes.bool,
  isPreview: PropTypes.bool,
  onAction: PropTypes.func,
  onPublishSuccess: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  product: PropTypes.object
};

function composer(props, onData) {
  const viewAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  if (Array.isArray(props.documentIds) && props.documentIds.length) {
    onData(null, {
      documentIds: props.documentIds,
      documents: props.documents,
      isPreview: viewAs === "customer"
    });

    return;
  }

  onData(null, {
    isPreview: viewAs === "customer"
  });
}

export default composeWithTracker(composer)(PublishContainer);

import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import PublishControls from "../components/publishControls";
import { Tags, Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";
import { isRevisionControlEnabled } from "../../lib/api";
import { Reaction, i18next } from "/client/api";

/*
 * PublishContainer is a container component connected to Meteor data source.
 */
class PublishContainer extends Component {
  handleAddProduct() {
    Meteor.call("products/createProduct", (error, productId) => {
      if (Meteor.isClient) {
        let currentTag;
        let currentTagId;

        if (error) {
          throw new Meteor.Error("createProduct error", error);
        } else if (productId) {
          currentTagId = Session.get("currentTag");
          currentTag = Tags.findOne(currentTagId);
          if (currentTag) {
            Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
          }
          // go to new product
          Reaction.Router.go("product", {
            handle: productId
          });
        }
      }
    });
  }

  handleViewContextChange = (event, value) => {
    Reaction.Router.setQueryParams({ as: value });
  }

  handlePublishClick = (revisions) => {
    if (Array.isArray(revisions)) {
      let documentIds = revisions.map((revision) => {
        if (revision.parentDocument && revision.documentType !== "product") {
          return revision.parentDocument;
        }
        return revision.documentId;
      });

      const documentIdsSet = new Set(documentIds); // ensures they are unique
      documentIds = Array.from(documentIdsSet);
      Meteor.call("revisions/publish", documentIds, (error, result) => {
        if (result === true) {
          const message = i18next.t("revisions.changedPublished", {
            defaultValue: "Changes published successfully"
          });

          Alerts.toast(message, "success");
        } else {
          const message = i18next.t("revisions.noChangesPublished", {
            defaultValue: "There are no changes to publish"
          });

          Alerts.toast(message, "warning");
        }
      });
    }
  }

  handlePublishActions = (event, action, documentIds) => {
    switch (action) {
      case "archive":
        if (this.props.onAction) {
          this.props.onAction(event, action, this.props.documentIds);
        }
        break;
      case "discard":
        Meteor.call("revisions/discard", documentIds, (error, result) => {
          if (result === true) {
            const message = i18next.t("revisions.changesDiscarded", {
              defaultValue: "Changes discarded successfully"
            });

            Alerts.toast(message, "success");
          } else {
            const message = i18next.t("revisions.noChangesDiscarded", {
              defaultValue: "There are no changes to discard"
            });

            Alerts.toast(message, "warning");
          }
        });
        break;
      default:
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
          onViewContextChange={this.handleViewContextChange}
          onAddProduct={this.handleAddProduct}
          revisions={this.props.revisions}
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
  onVisibilityChange: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object)
};

function composer(props, onData) {
  const viewAs = Reaction.Router.getQueryParam("as");

  if (props.documentIds) {
    const subscription = Meteor.subscribe("Revisions", props.documentIds);

    if (subscription.ready()) {
      const revisions = Revisions.find({
        "$or": [
          {
            documentId: {
              $in: props.documentIds
            }
          },
          {
            "documentData.ancestors": {
              $in: props.documentIds
            }
          },
          {
            parentDocument: {
              $in: props.documentIds
            }
          }
        ],
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        }
      }).fetch();
      onData(null, {
        isEnabled: isRevisionControlEnabled(),
        documentIds: props.documentIds,
        documents: props.documents,
        revisions,
        isPreview: viewAs === "customer" ? true : false
      });

      return;
    }
  }

  onData(null, {
    isEnabled: isRevisionControlEnabled(),
    isPreview: viewAs === "customer" ? true : false
  });
}

export default composeWithTracker(composer)(PublishContainer);

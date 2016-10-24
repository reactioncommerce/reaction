import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import PublishControls from "../components/publishControls";
import { Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";
import { isRevisionControlEnabled } from "../../lib/api";
import { i18next } from "/client/api";

/*
 * PublishContainer is a container component connected to Meteor data source.
 */
class PublishContainer extends Component {
  handlePublishClick = (revisions) => {
    if (Array.isArray(revisions)) {
      const documentIds = revisions.map((revision) => {
        return revision.documentId;
      });

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
          revisions={this.props.revisions}
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
  onVisibilityChange: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object)
};

function composer(props, onData) {
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
        revisions
      });

      return;
    }
  }

  onData(null, {
    isEnabled: isRevisionControlEnabled()
  });
}

export default composeWithTracker(composer)(PublishContainer);

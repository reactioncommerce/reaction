import React, { PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import PublishControls from "../components/publishControls";
import { Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider";
import { isRevisionControlEnabled } from "../../lib/api";

/**
 * Publish container is a stateless container component connected to Meteor data source.
 * @param  {Object} props Component props
 * @return {PropTypes.node} react node
 */
const PublishContainer = (props) => {
  return (
    <div>
      <TranslationProvider>
        <PublishControls
          isEnabled={props.isEnabled}
          onPublishClick={handlePublishClick}
          revisions={props.revisions}
        />
      </TranslationProvider>
    </div>
  );
};

PublishContainer.propTypes = {
  isEnabled: PropTypes.bool,
  revisions: PropTypes.arrayOf(PropTypes.object)
};

export function handlePublishClick(revisions) {
  if (Array.isArray(revisions)) {
    const documentIds = revisions.map((revision) => {
      return revision.documentId;
    });
    Meteor.call("revisions/publish", documentIds);
  }
}

function composer(props, onData) {
  if (props.documentIds) {
    const subscription = Meteor.subscribe("Revisions", props.documentIds);

    if (subscription.ready()) {
      const revisions = Revisions.find({
        documentId: {
          $in: props.documentIds
        }
      }).fetch();

      onData(null, {
        isEnabled: isRevisionControlEnabled(),
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

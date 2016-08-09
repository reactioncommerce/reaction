import React, { PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import PublishControls from "../components/publishControls";
import { Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider"

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
          onPublishClick={handlePublishClick}
          revision={props.revisions[0]}
        />
      </TranslationProvider>
    </div>
  );
};

export function handlePublishClick(documentId) {
  Meteor.call("revisions/publish", documentId);
}

function composer(props, onData) {
  if (props.documentId) {
    const subscription = Meteor.subscribe("Revisions", props.documentId);

    if (subscription.ready()) {
      const revisions = Revisions.find({
        documentId: props.documentId
      }).fetch();

      onData(null, {
        revisions
      });
    }
  }
}

export default composeWithTracker(composer)(PublishContainer);

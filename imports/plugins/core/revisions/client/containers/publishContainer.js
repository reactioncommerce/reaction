import React, { PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import PublishControls from "../components/publishControls";
import { Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import TranslationProvider from "/imports/plugins/core/ui/client/providers/translationProvider"
import isArray from "lodash/isArray";
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
          revisions={props.revisions}
        />
      </TranslationProvider>
    </div>
  );
};

PublishContainer.propTypes = {
  revisions: PropTypes.arrayOf(PropTypes.object)
};

export function handlePublishClick(revisions) {
  console.log("revisions", revisions);
  if (isArray(revisions)) {
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
        revisions
      });
    }
  }
}

export default composeWithTracker(composer)(PublishContainer);

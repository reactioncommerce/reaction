import React from "react";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { composeWithTracker } from "/lib/api/compose";

function composer(props, onData) {
  onData(null, {});
}

export default function TagNavContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <TranslationProvider>
        <Comp {...props} />
      </TranslationProvider>
    );
  }

  return composeWithTracker(composer, null)(CompositeComponent);
}

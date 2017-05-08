import React from "react";
import { composeWithTracker } from "/lib/api/compose";

function composer(props, onData) {
  onData(null, {});
}

export default function TagNavContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <Comp {...props} />
    );
  }

  return composeWithTracker(composer, null)(CompositeComponent);
}

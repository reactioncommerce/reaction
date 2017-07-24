import React from "react";
import { Tracker } from "meteor/tracker";
import { Components } from "./components";
import { compose } from "./composer";

/**
 * getTrackerLoader creates a Meteor Tracker to watch dep updates from
 * passed in reactiveMapper funtion
 * @param  {Function} reactiveMapper data fetching function to bind to a tracker
 * @return {Function} composed function
 */
function getTrackerLoader(reactiveMapper) {
  return (props, onData, env) => {
    let trackerCleanup = null;
    const handler = Tracker.nonreactive(() => {
      return Tracker.autorun(() => {
        // assign the custom clean-up function.
        trackerCleanup = reactiveMapper(props, onData, env);
      });
    });

    return () => {
      if (typeof trackerCleanup === "function") trackerCleanup();
      return handler.stop();
    };
  };
}

/**
 * Re-implementation of composeWithTracker from v1.x
 * @param {Function} reactiveMapper data fetching function to bind to a tracker
 * @param {React.Component} LoadingComponent react component for a custom loading screen
 * @return {Function} composed function
 */
export function composeWithTracker(reactiveMapper, LoadingComponent) {
  const options = {
    // eslint-disable-next-line react/display-name
    loadingHandler: () => typeof LoadingComponent !== "undefined" ? <LoadingComponent /> : <Components.Loading />
  };
  return compose(getTrackerLoader(reactiveMapper), options);
}

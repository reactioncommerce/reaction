/**
 * Wrapper around react-komposer v2 to provide some backwars compatability
 * for features from v1.
 */
import { compose } from "react-komposer";
import React from "react";
export * from "react-komposer";

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
  const options = {};

  if (typeof LoadingComponent === "undefined") {
    options.loadingHandler = () => { // eslint-disable-line react/display-name
      return (
        <LoadingComponent />
      );
    };
  }

  return compose(getTrackerLoader(reactiveMapper), options);
}

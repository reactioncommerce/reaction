import React from "react";
import { Tracker } from "meteor/tracker";
import { Components } from "../components";
import compose from "./compose";


/**
 * getTrackerLoader creates a Meteor Tracker to watch dep updates from
 * the passed in reactiveMapper function
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
 * A higher order component to wrap a reactive function with Meteor's Tracker
 * @param {Function} reactiveMapper data fetching function to bind to a tracker
 * @param {React.Component|Boolean|Object} options can be a custom loader, false (to disable), or a full options object
 * @return {Function} composed function
 */
export function composeWithTracker(reactiveMapper, options) {
  let composeOptions = {};

  if (typeof options === "undefined") {
    // eslint-disable-next-line react/display-name
    composeOptions.loadingHandler = () => <Components.Loading />;
  }

  if (typeof options === "function") {
    const CustomLoader = options;
    // eslint-disable-next-line
    composeOptions.loadingHandler = () => <CustomLoader />;
  }

  if (typeof options === "object") {
    composeOptions = options;
  }

  return compose(getTrackerLoader(reactiveMapper), composeOptions);
}

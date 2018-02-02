import React from "react";
import { Tracker } from "meteor/tracker";
import { Components } from "../components";
import compose from "./compose";

/**
 * @file **Reaction Components API** - Most of the React components in the Reaction UI can be replaced or extended with the API outlined here. This allows anyone to create a custom plugin that can easily change the look of the UI and/or extend its functionality without having to edit core Reaction code. See {@link https://docs.reactioncommerce.com/reaction-docs/master/components-api full tutorial and documentation}.
 *
 * @example // Register a component and container(s) with a name.
 * // The raw component can then be extended or replaced.
 *
 * // Structure of a component in the list:
 *
 * ComponentsTable.MyComponent = {
 *    name: 'MyComponent',
 *    hocs: [fn1, fn2],
 *    rawComponent: React.Component
 * }
 * @namespace Components
 */

/**
 * @name getTrackerLoader
 * @summary getTrackerLoader creates a Meteor Tracker to watch dep updates from
 * the passed in reactiveMapper function
 * @param  {Function} reactiveMapper data fetching function to bind to a tracker
 * @return {Function} composed function
 * @memberof Components
 * @private
 */
function getTrackerLoader(reactiveMapper) {
  return (props, onData, env) => {
    let trackerCleanup = null;
    const handler = Tracker.nonreactive(() => Tracker.autorun(() => {
      // assign the custom clean-up function.
      trackerCleanup = reactiveMapper(props, onData, env);
    }));

    return () => {
      if (typeof trackerCleanup === "function") trackerCleanup();
      return handler.stop();
    };
  };
}


/**
 * @name composeWithTracker
 * @method
 * @summary A higher order component to wrap a reactive function with Meteor's Tracker
 * @param {Function} reactiveMapper data fetching function to bind to a tracker
 * @param {React.Component|Boolean|Object} options can be a custom loader, false (to disable), or a full options object
 * @return {Function} composed function
 * @memberof Components
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

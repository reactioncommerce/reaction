import hoistStatics from "hoist-non-react-statics";
import compose from "./compose";

/**
 * Copy static methods to the new wrapped component
 * https://facebook.github.io/react/docs/higher-order-components.html#static-methods-must-be-copied-over
 * @param  {Function} Container - component to copy statics to
 * @param  {Function} ChildComponent - component to copy statics from
 * @return {Function} returns wrapped component with hoised statics
 */
export function inheritStatics(Container, ChildComponent) {
  const childDisplayName =
      // Get the display name if it's set.
      ChildComponent.displayName ||
      // or get the display name from the function name.
      ChildComponent.name ||
      // if neither exist, just add a default.
      "ChildComponent";

  Container.displayName = `Tracker(${childDisplayName})`;

  return hoistStatics(Container, ChildComponent);
}

/**
 * Set default options for a compose instance
 * @param {Object} defaultOptions - the default options to use for all composed components
 * @return {Function} - returns a React component wrapped with a HOC
 */
export function setDefaults(defaultOptions = {}) {
  return function (dataLoader, otherOptions = {}) {
    const options = {
      ...defaultOptions,
      ...otherOptions
    };
    return compose(dataLoader, options);
  };
}

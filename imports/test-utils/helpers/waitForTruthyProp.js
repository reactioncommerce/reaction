/**
 * @name waitForTruthyProp
 * @summary Promise function that resolves when an enzyme-mounted React component's prop in question is truthy.
 *  Useful for waiting until a GraphQL HOC has finished loading data (via Apollo's MockedProvider) in unit tests.
 * @namespace TestHelpers
 * @param {ReactWrapper} reactWrapper - result of calling enzyme's mount()
 * @param {String} componentName - name of component to check
 * @param {String} propName - name of prop on component to check for truthiness
 * @returns {Promise} that resolves when prop is truthy
 */
export default function waitForTruthyProp(reactWrapper, componentName, propName) {
  return new Promise((resolve) => {
    // Use timeout to prevent blocking event loop, to allow MockedProvider to update loading status asynchronously
    setTimeout(() => {
      if (reactWrapper.update().find(componentName).prop(propName)) {
        resolve(waitForTruthyProp());
      } else {
        resolve();
      }
    });
  });
}

import { compose, setDisplayName } from "recompose";

export const Components = {}; // populated with final wrapped components
export const ComponentsTable = {}; // storage for separate elements of each component

/**
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
 * @name registerComponent
 * @method
 * @memberof Components/Helpers
 * @param {String} name The name of the component to register.
 * @param {React.Component} rawComponent Interchangeable/extendable component.
 * @param {Function|Array} hocs The HOCs to wrap around the raw component.
 *
 * @returns {React.Component} returns the final wrapped component
 */
export function registerComponent(name, rawComponent, hocs = []) {
  if (!name || !rawComponent) {
    throw new Error("A name and component are required for registerComponent");
  }

  // store the component in the table
  ComponentsTable[name] = {
    name,
    rawComponent,
    hocs: Array.isArray(hocs) ? hocs : [hocs]
  };
}


/**
 * @name registerHOC
 * @method
 * @summary Register containers (HOC) with a name.
 * If some containers already exist for the component, they will be extended.
 * @param {String} name The name of the component to register.
 * @param {Function|Array} hocs The HOCs to wrap around the raw component.
 * @memberof Components/Helpers
 * @returns {undefined}
 */
export function registerHOC(name, hocs = []) {
  if (!name || !hocs) {
    throw new Error("A name and HOC(s) are required for registerHOC");
  }

  const newHOCs = Array.isArray(hocs) ? hocs : [hocs];

  const existingComponent = ComponentsTable[name];

  // Check to see if this component has already been registered and whether it has
  // HOC's to merge with our new ones. If not, just register it like a new component.
  // This allows us to register HOCs _before_ registering the UI component.
  // Just keep in mind that the resulting component will definitely throw an error
  // if a UI component doesn't eventually get registered.
  if (!!existingComponent && !!existingComponent.hocs) {
    const existingHOCs = existingComponent.hocs;

    ComponentsTable[name] = {
      name,
      hocs: [...newHOCs, ...existingHOCs]
    };
  } else {
    ComponentsTable[name] = {
      name,
      hocs: newHOCs
    };
  }
}


/**
 * @name getComponent
 * @method
 * @summary Get a component registered with registerComponent(name, component, ...hocs).
 * @param {String} name The name of the component to get.
 * @returns {Function|React.Component} A (wrapped) React component
 * @memberof Components/Helpers
 */
export function getComponent(name) {
  const component = ComponentsTable[name];

  if (!component) {
    throw new Error(`Component ${name} not registered.`);
  }

  const hocs = component.hocs.map((hoc) => (Array.isArray(hoc) ? hoc[0](hoc[1]) : hoc));

  return compose(...hocs, setDisplayName(`Reaction(${name})`))(component.rawComponent);
}


/**
 * @name replaceComponent
 * @method
 * @summary Replace a Reaction component with a new component and optionally add one or more higher order components.
 * This function keeps track of the previous HOCs and wraps the new HOCs around previous ones
 * @param {String} name The name of the component to register.
 * @param {React.Component} newComponent Interchangeable/extendable component.
 * @param {Function|Array} hocs The HOCs to compose with the raw component.
 * @returns {Function|React.Component} A component callable with Components[name]
 * @memberof Components/Helpers
 */
export function replaceComponent(name, newComponent, hocs = []) {
  const previousComponent = ComponentsTable[name];

  if (!previousComponent) {
    throw new Error(`Component '${name}' not found. Use registerComponent to create it.`);
  }

  const newHocs = Array.isArray(hocs) ? hocs : [hocs];

  return registerComponent(name, newComponent, [...newHocs, ...previousComponent.hocs]);
}


/**
 * @name getRawComponent
 * @method
 * @summary Get the raw UI component without any possible HOCs wrapping it.
 * @param {String} name The name of the component to get.
 * @returns {Function|React.Component} A React component
 * @memberof Components/Helpers
 */
export const getRawComponent = (name) => ComponentsTable[name].rawComponent;


/**
 * @name getHOCs
 * @method
 * @summary Get the raw UI component without any possible HOCs wrapping it.
 * @param {String} name The name of the component to get.
 * @returns {Function|React.Component} Array of HOCs
 * @memberof Components/Helpers
 */
export const getHOCs = (name) => ComponentsTable[name].hocs;


/**
 * @name copyHOCs
 * @method
 * @summary Wrap a new component with the HOCs from a different component
 * @param {String} sourceComponentName The name of the component to get the HOCs from
 * @param {Function|React.Component} targetComponent Component to wrap
 * @returns {Function|React.Component} A new component wrapped with the HOCs of the source component
 * @memberof Components/Helpers
 */
export function copyHOCs(sourceComponentName, targetComponent) {
  const sourceComponent = ComponentsTable[sourceComponentName];
  return compose(...sourceComponent.hocs)(targetComponent);
}


/**
 * @name loadRegisteredComponents
 * @method
 * @summary Populate the final Components object with the contents of the lookup table.
 * This should only be called once on app startup.
 * @returns {Object} An object containing all of the registered components
 * @memberof Components/Helpers
 **/
export function loadRegisteredComponents() {
  Object.keys(ComponentsTable).forEach((name) => {
    Components[name] = getComponent(name);
  });

  return Components;
}

export const Schemas = {}; // populated with all Schemas

/**
 * Register a component and container(s) with a name.
 * The raw component can then be extended or replaced.
 *
 * Structure of a component in the list:
 *
 * ComponentsTable.MyComponent = {
 *    name: 'MyComponent',
 *    hocs: [fn1, fn2],
 *    rawComponent: React.Component
 * }
 *
 * @param {String} name The name of the component to register.
 * @param {React.Component} rawComponent Interchangeable/extendable component.
 * @param {Function|[Function]} hocs The HOCs to wrap around the raw component.
 *
 * @returns {React.Component} returns the final wrapped component
 */
export function registerSchema(name, schema) {
  if (!name || !schema) {
    throw new Error("A name and schema object are required for registerSchema");
  }

  // store the component in the table
  Schemas[name] = schema;
}






/**
 * Get a component registered with registerComponent(name, component, ...hocs).
 * @param {String} name The name of the component to get.
 * @return {Function|React.Component} A (wrapped) React component
 */
export function getSchemas() {
  return Schemas;
}

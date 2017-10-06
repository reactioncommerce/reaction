export const Schemas = {}; // populated with all Schemas

/**
 * Register a schema
 * @param {String} name The name of the schema to register.
 * @param {Array} schema Schema data.
 *
 * @returns {Empty} no return. Adds schema to Schemas object
 */
export function registerSchema(name, schema) {
  if (!name || !schema) {
    throw new Error("A name and schema object are required for registerSchema");
  }

  // store the component in the table
  Schemas[name] = schema;
}

/**
 * Get all schemas registered with registerSchema().
 * @return {Object} An object that contains all registered schemas
 */
export function getSchemas() {
  return Schemas;
}

export const Schemas = {}; // populated with all Schemas

/**
 * @file **Reaction Schemas** - Use these methods to register and fetch Reaction Core schemas. See {@link https://docs.reactioncommerce.com/reaction-docs/master/simple-schema full documentation}.
 *
 * @module collections
 */

/**
 * @name registerSchema
 * @method
 * @summary Register a schema. Adds schema to Schemas object.
 * @param {String} name The name of the schema to register.
 * @param {Array} schema Schema data.
 * @returns {void}
 */
export function registerSchema(name, schema) {
  if (!name || !schema) {
    throw new Error("A name and schema object are required for registerSchema");
  }

  // store the component in the table
  Schemas[name] = schema;
}

/**
 * @name getSchemas
 * @method
 * @summary Get all schemas registered with `registerSchema()`.
 * @return {Object} An object that contains all registered schemas
 */
export function getSchemas() {
  return Schemas;
}

import { getMockDoc } from "simpl-schema-mockdoc";

/**
 * @const {Object} Factory - todo
 * @todo write const desciption
 */
export const Factory = {};

/**
 * @name createFactoryForSchema
 * @function
 * @summary Creates Factory[propName] for building fake documents with the given schema.
 * @param {String} propName The property name to add to the `Factory` object. This should match the
 *   schema variable's name.
 * @param {SimpleSchema} schema A SimpleSchema instance
 */
export function createFactoryForSchema(propName, schema) {
  // eslint-disable-next-line
  if (Factory.hasOwnProperty(propName)) {
    throw new Error(`Factory already has a "${propName}" property`);
  }

  Factory[propName] = {
    makeOne(props) {
      const doc = getMockDoc(schema, "mock", true);
      Object.assign(doc, props);
      return doc;
    },
    makeMany(length, props) {
      return Array.from({ length }).map(() => this.makeOne(props));
    }
  };
}

import SimpleSchema from "simpl-schema";
/**
 * @name collectCollectionFields
 * @method
 * @memberof GraphQL/Filter
 * @summary collects all the fields of the specific collection along with metadata
 * @param {Object} context - an object containing the per-request state
 * @param {String} collectionName - name of the collection
 * @returns {Object} - Object with each field as key and type as value
 */
export default function collectCollectionFields(context, collectionName) {
  const currentSchema = context.simpleSchemas[collectionName];
  const mergedSchemaObject = currentSchema.mergedSchema();
  const allKeys = Object.keys(mergedSchemaObject);
  const returnFieldTypes = {};
  allKeys.forEach((element) => {
    const definitionObj = currentSchema.getDefinition(element);
    const definition = definitionObj.type[0].type;
    if (!SimpleSchema.isSimpleSchema(definition)) { // skip SimpleSchema definition names
      if (typeof definition === "function") {
        returnFieldTypes[element] = `SimpleSchema.${definition.name}`;
      } else {
        returnFieldTypes[element] = definition;
      }
    }
  });
  return returnFieldTypes;
}

import SimpleSchema, { toJsonSchema } from "simpl-schema";

const currentPath = ["$"];
const inputSchema = new SimpleSchema({
  shopId: String,
  schemaName: String
});

/**
 * @name updateJsonSchema
 * @summary Update the JSON Schema to add additional path field for each object
 * @param {Object} jsonSchema - JSON Schema object
 * @returns {Object} JSON Schema object with path field added
 */
function updateJsonSchema(jsonSchema) {
  if (jsonSchema.type === "object" && jsonSchema.properties) {
    const currentObject = jsonSchema.properties;
    Object.keys(currentObject).forEach((key) => {
      currentObject[key].path = `${currentPath.join(".")}.${key}`;
      if (currentObject[key].type === "object") {
        currentPath.push(key);
        updateJsonSchema(currentObject[key]); // recursive call
        currentPath.pop();
      } else if (currentObject[key].type === "array" && currentObject[key].items && currentObject[key].items.length) {
        currentPath.push(key);
        currentPath.push("[0]");
        const itemObject = currentObject[key].items[0];
        updateJsonSchema(itemObject); // recursive call
        itemObject.path = `${currentPath.join(".")}`;
        currentPath.splice(-2, 2);
      } else {
        currentObject[key].path = `${currentPath.join(".")}.${key}`; // when not object/array, we just update the path
      }
    });
  } else if (jsonSchema.type === "array" && jsonSchema.items && jsonSchema.items.length) {
    currentPath.push("[0]");
    const itemObject = jsonSchema.items[0];
    updateJsonSchema(itemObject); // recursive call
    itemObject.path = `${currentPath.join(".")}`;
    currentPath.pop();
  } else {
    jsonSchema.path = currentPath.join("."); // when not object/array, we just update the path
  }
  jsonSchema.path = currentPath.join("."); // top level path
  return jsonSchema;
}

/**
 * @name queryFields
 * @summary Extract the Schema of the required collection from context, convert to Json and return
 * @param {Object} context - an object containing the per-request state
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} [args.shopId] - shopID
 * @param {String} [args.schemaName] - schemaName to query
 * @returns {Promise<Object>} JSON Schema object Promise
 */
export default async function queryFields(context, { shopId, schemaName } = {}) {
  const validationString = "reaction:legacy:simpleSchema";
  inputSchema.validate({ shopId, schemaName });

  // Check for global schema permissions, if not found, check for schema specific permissions
  try {
    await context.validatePermissions(validationString, "introspect:*", { shopId });
  } catch (error) {
    await context.validatePermissions(validationString, `introspect:${schemaName}`, { shopId }); // if this throws, its valid access denied
  }

  const currentSchema = context.simpleSchemas[schemaName];
  if (!currentSchema) {
    throw new Error("Invalid collection name");
  }

  const jsonSchema = toJsonSchema(currentSchema);
  return updateJsonSchema(jsonSchema);
}

import SimpleSchema, { toJsonSchema } from "simpl-schema";

const inputSchema = new SimpleSchema({
  shopId: {
    type: String,
    optional: true
  },
  schemaName: String
});

/**
 * @name updateJsonSchema
 * @summary Update the JSON Schema to add additional path field for each object. This is as per the requirement from
 * the FrontEnd team as it would reduce the work to calculate this property on the client side.
 * @param {Object} jsonSchema - JSON Schema object
 * @param {Array} currentPath - Default value for Array of path to the current object
 * @returns {Object} JSON Schema object with path field added
 */
function updateJsonSchema(jsonSchema, currentPath = ["$"]) {
  if (jsonSchema.type === "object" && jsonSchema.properties) {
    const currentObject = jsonSchema.properties;
    Object.keys(currentObject).forEach((key) => {
      currentObject[key].path = `${currentPath.join(".")}.${key}`;
      if (currentObject[key].type === "object") {
        currentPath.push(key);
        updateJsonSchema(currentObject[key], currentPath); // recursive call
        currentPath.pop();
      } else if (currentObject[key].type === "array" && currentObject[key].items && currentObject[key].items.length) {
        currentPath.push(key);
        currentPath.push("[0]");
        const itemObject = currentObject[key].items[0];
        updateJsonSchema(itemObject, currentPath); // recursive call
        itemObject.path = `${currentPath.join(".")}`;
        currentPath.splice(-2, 2);
      } else {
        currentObject[key].path = `${currentPath.join(".")}.${key}`; // when not object/array, we just update the path
      }
    });
  } else if (jsonSchema.type === "array" && jsonSchema.items && jsonSchema.items.length) {
    currentPath.push("[0]");
    const itemObject = jsonSchema.items[0];
    updateJsonSchema(itemObject, currentPath); // recursive call
    itemObject.path = `${currentPath.join(".")}`;
    currentPath.pop();
  } else {
    jsonSchema.path = currentPath.join("."); // when not object/array, we just update the path
  }
  jsonSchema.path = currentPath.join("."); // top level path
  return jsonSchema;
}

/**
 * @name introspectSchema
 * @summary Extract the Schema of the required collection from context, convert to Json and return
 * @param {Object} context - an object containing the per-request state
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} [args.shopId] - shopID
 * @param {String} [args.schemaName] - schemaName to query
 * @returns {Promise<Object>} JSON Schema object Promise
 */
export default async function introspectSchema(context, { shopId, schemaName } = {}) {
  inputSchema.validate({ shopId, schemaName });
  const validationString = `reaction:legacy:simpleSchema:${schemaName}`;

  await context.validatePermissions(validationString, "introspect", { shopId });

  const currentSchema = context.simpleSchemas[schemaName];
  if (!currentSchema) {
    throw new Error("Invalid schema name");
  }

  const jsonSchema = toJsonSchema(currentSchema);
  return updateJsonSchema(jsonSchema);
}

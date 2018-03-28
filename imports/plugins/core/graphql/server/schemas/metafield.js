/**
 * Metafield input
 * @typedef {Object} MetafieldInput - Metafield
 * @property {String} key - Key
 * @property {String} [value] - Value
 * @property {String} [namespace] - Namespace
 * @property {String} [scope] - Scope
 * @property {String} [description] - Description
 * @property {String} [valueType] - Value type
 */

export const typeDefs = `
  # User defined attributes. You can include only \`key\` and use these like tags,
  # or also include a \`value\`.
  input MetafieldInput {
    description: String
    key: String!
    namespace: String
    scope: String
    value: String
    valueType: String
  }

  # User defined attributes
  type Metafield {
    description: String
    key: String
    namespace: String
    scope: String
    value: String
    valueType: String
  }
`;

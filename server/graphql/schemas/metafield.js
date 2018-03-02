// TODO: Conform this schema to Reaction Metafield spec.
// See /lib/collections/schemas/metafield.js
export const typeDefs = `
  type Metafield {
    key: String
    namespace: String
    scope: String
    value: String
    valueType: String
    description: String
  }

  input MetafieldInput {
    key: String
    namespace: String
    scope: String
    value: String
    valueType: String
    description: String
  }
`;

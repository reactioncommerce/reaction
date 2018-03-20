export const typeDefs = `
  # User defined attributes
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

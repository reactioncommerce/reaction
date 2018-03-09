export const typeDefs = `
  input CreateMetafieldInput {
    description: String
    key: String!
    namespace: String
    scope: String
    value: String
    valueType: String
  }

  input UpdateMetafieldInput {
    description: String
    key: String!
    namespace: String
    scope: String
    value: String
    valueType: String
  }

  # User defined attributes.
  # NOTE: key attribute is modified to be required.
  type Metafield {
    description: String
    key: String
    namespace: String
    scope: String
    value: String
    valueType: String
  }
`;

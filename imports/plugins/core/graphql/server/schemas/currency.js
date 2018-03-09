export const typeDefs = `
  # Currency
  # NOTE: This is modeled as an map in the current code. The currency code is
  # they key in the map. Transform to an array, with the key mapped as _id and
  # code in the object.
  type Currency implements Node {
    _id: ID!
    code: String!
    symbol: String!
    format: String!
    scale: Float
    decimal: String
    thousand: String
    rate: Int
  }

  type CurrencyConnection implements NodeConnection {
    edges: [CurrencyEdge]
    nodes: [Currency]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CurrencyEdge implements NodeEdge {
    cursor: String!
    node: [Currency]
  }
`;

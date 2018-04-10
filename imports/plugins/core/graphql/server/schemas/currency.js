// NOTE: Currency is modeled as an map in the current code. The currency code is
// they key in the map. Transform to an array, with the key mapped as _id and
// code in the object.
export const typeDefs = `
  # Represents one type of currency
  type Currency implements Node {
    _id: ID!
    code: String!
    symbol: String!
    format: String!
    scale: Int
    decimal: String
    thousand: String
    rate: Float
  }

  # Wraps a list of \`Currencies\`, providing pagination cursors and information.
  type CurrencyConnection implements NodeConnection {
    edges: [CurrencyEdge]
    nodes: [Currency]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A connection edge in which each node is an \`Currency\` object
  type CurrencyEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Currency
  }
`;

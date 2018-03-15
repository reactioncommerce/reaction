export const typeDefs = `
  interface Node {
    _id: ID!
  }

  interface NodeEdge {
    cursor: String!
    node: [Node]
  }

  interface NodeConnection {
    edges: [NodeEdge]
    nodes: [Node]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }
`;

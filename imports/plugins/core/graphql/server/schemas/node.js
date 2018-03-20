export const typeDefs = `
  scalar ConnectionCursor

  enum SortOrder {
    asc
    desc
  }

  interface Node {
    _id: ID!
  }

  interface NodeEdge {
    cursor: ConnectionCursor!
    node: Node
  }

  interface NodeConnection {
    edges: [NodeEdge]
    nodes: [Node]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    endCursor: ConnectionCursor
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: ConnectionCursor
  }
`;

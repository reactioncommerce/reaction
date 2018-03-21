export const typeDefs = `
  # An opaque string that identifies a particular result within a connection,
  # allowing you to request a subset of results before or after that result.
  scalar ConnectionCursor

  # An integer between 1 and 50, inclusive. Values less than 1 become 1 and
  # values greater than 50 become 50.
  scalar ConnectionLimitInt

  # The order in which the connection results should be sorted, based on the
  # \`sortBy\` field. "asc" means "ascending" while "desc" means "ascending".
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

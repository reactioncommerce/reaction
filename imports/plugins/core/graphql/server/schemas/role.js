export const typeDefs = `
  # The fields by which you are allowed to sort any query that returns an \`RoleConnection\`
  enum RoleSortByField {
    name
    _id
  }

  # Represents a named role
  type Role implements Node {
    _id: ID!
    name: String!
  }

  # Wraps a list of \`Roles\`, providing pagination cursors and information.
  type RoleConnection implements NodeConnection {
    edges: [RoleEdge]
    nodes: [Role]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A connection edge in which each node is a \`Role\` object
  type RoleEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Role
  }

  extend type Query {
    roles(shopId: ID!, after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: RoleSortByField = createdAt): RoleConnection
  }
`;

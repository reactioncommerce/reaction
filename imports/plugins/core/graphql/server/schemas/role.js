export const typeDefs = `
  # RoleName - String that conforms to Role regex.
  # This may be required if the role name must match a specific pattern.
  # Could also be made more generic depending on pattern.
  # Remove if not used.
  scalar RoleName

  # Represents a named role
  type Role implements Node {
    _id: ID!
    name: RoleName!
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
    roles(shopId: ID!): RoleConnection
  }
`;

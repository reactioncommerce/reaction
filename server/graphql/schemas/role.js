export const typeDefs = `
  # RoleName - String that conforms to Role regex.
  # This may be required if the role name must match a specific pattern.
  # Could also be made more generic depending on pattern.
  # Remove if not used.
  scalar RoleName

  # Roles schema doesn't exist in Reaction.
  type Role implements Node {
    _id: ID!
    name: RoleName!
  }

  type RoleConnection implements NodeConnection {
    edges: [RoleEdge]
    nodes: [Role]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type RoleEdge implements NodeEdge {
    cursor: String!
    node: [Role]
  }

  extend type Query {
    roles(shopId: ID!): [String]
  }
`;

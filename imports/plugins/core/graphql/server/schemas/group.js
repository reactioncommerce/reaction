export const typeDefs = `
  # The details for creating or updating a group
  input GroupInput {
    description: String
    name: String!
    permissions: [String]
    slug: String!
  }

  # Represents an account group
  type Group implements Node {
    _id: ID!
    createdAt: DateTime!
    createdBy: Account
    description: String
    name: String!
    permissions: [String]
    shop: Shop
    slug: String!
    updatedAt: DateTime!
  }

  # Wraps a list of \`Groups\`, providing pagination cursors and information.
  type GroupConnection implements NodeConnection {
    edges: [GroupEdge]
    nodes: [Group]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A connection edge in which each node is a \`Group\` object
  type GroupEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Group
  }

  extend type Mutation {
    createGroup(shopId: ID!, group: GroupInput!): Group
    updateGroup(shopId: ID!, id: ID!, modifier: GroupInput!): Group
  }

  extend type Query {
    group(id: ID!): Group
    groups(shopId: ID!): GroupConnection
  }
`;

export const typeDefs = `
  input GroupInput {
    description: String
    name: String!
    permissions: [String]
    slug: String!
  }

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

  type GroupConnection implements NodeConnection {
    edges: [GroupEdge]
    nodes: [Group]
    pageInfo: PageInfo!
    totalCount: Int!
  }

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

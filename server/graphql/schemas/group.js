export const typeDefs = `
  input CreateGroupInput {
    description: String
    name: String!
    permissions: [String]
    slug: String!
  }

  input UpdateGroupInput {
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
    cursor: String!
    node: [Group]
  }

  extend type Mutation {
    createGroup(shopId: ID!, input: CreateGroupInput!): Group
    updateGroup(id: ID!, modifier: UpdateGroupInput!, shopId: ID!): Group
  }

  extend type Query {
    group(id: ID!): Group
    groups(shopId: ID!): GroupConnection
  }
`;

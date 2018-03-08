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
    cursor: String!
    node: [Group]
  }
`;

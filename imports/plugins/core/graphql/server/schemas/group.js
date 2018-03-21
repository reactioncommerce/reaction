export const typeDefs = `
  # The fields by which you are allowed to sort any query that returns an \`GroupConnection\`
  enum GroupSortByField {
    _id
    name
    createdAt
    updatedAt
  }

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
    # Returns a single group by ID.
    group(id: ID!): Group
    # Returns a list of groups for the shop with ID \`shopId\`, as a Relay-compatible connection.
    groups(shopId: ID!, after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: GroupSortByField = createdAt): GroupConnection
  }
`;

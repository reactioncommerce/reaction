/* eslint-disable max-len */
export const typeDefs = `
  # The fields by which you are allowed to sort any query that returns an \`GroupConnection\`
  enum GroupSortByField {
    _id
    name
    createdAt
    updatedAt
  }

  # A group definition
  input GroupInput {
    description: String
    name: String!
    permissions: [String]
    slug: String!
  }

  # The details for creating a group
  input CreateGroupInput {
    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # The group to create
    group: GroupInput!

    # The ID of the shop this group belongs to
    shopId: ID!
  }

  # The details for updating a group
  input UpdateGroupInput {
    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # The group ID
    id: ID!

    # The ID of the shop this group belongs to
    shopId: ID!

    # The changes to apply to the group
    updates: GroupInput!
  }

  # The details for removing a group
  input RemoveGroupInput {
    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # The group ID
    id: ID!
  }

  # Defines a group and account that should be linked
  input AddAccountToGroupInput {
    # The account ID
    accountId: ID!

    # The group ID
    groupId: ID!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
  }

  # Defines a group and account that should be unlinked
  input RemoveAccountFromGroupInput {
    # The account ID
    accountId: ID!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # The group ID
    groupId: ID!
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

  # The response from the \`addAccountToGroup\` mutation
  type AddAccountToGroupPayload {
    # The updated group
    group: Group

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`createGroup\` mutation
  type CreateGroupPayload {
    # The new group
    group: Group

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`updateGroup\` mutation
  type UpdateGroupPayload {
    # The updated group
    group: Group

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`removeAccountFromGroup\` mutation
  type RemoveAccountFromGroupPayload {
    # The updated group
    group: Group

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`removeGroup\` mutation
  type RemoveGroupPayload {
    # Successfully removed?
    wasRemoved: Boolean!

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  extend type Mutation {
    addAccountToGroup(input: AddAccountToGroupInput!): AddAccountToGroupPayload
    createGroup(input: CreateGroupInput!): CreateGroupPayload
    updateGroup(input: UpdateGroupInput!): UpdateGroupPayload
    removeAccountFromGroup(input: RemoveAccountFromGroupInput!): RemoveAccountFromGroupPayload
    removeGroup(input: RemoveGroupInput!): RemoveGroupPayload
  }

  extend type Query {
    # Returns a single group by ID.
    group(id: ID!): Group
    # Returns a list of groups for the shop with ID \`shopId\`, as a Relay-compatible connection.
    groups(shopId: ID!, after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: GroupSortByField = createdAt): GroupConnection
  }
`;

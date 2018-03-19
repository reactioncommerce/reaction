/**
 * Changes going from account MongoDB schema to the GraphQL schema:
 * - acceptsMarketing is removed.
 * - sessions is removed.
 * - state attribute is removed.
 * - taxSettings attribute is removed.
 * - username attribute is removed.
 * - AccountProfile is removed.
 * - addressBook is merged from profile.
 * - currency is merged from profile.
 * - preferences is merged from profile.
 * - note attribute is only used in Shopify import.
 */
export const typeDefs = `
  input UpdateAccountInput {
    currencyCode: String!
  }

  # The \`Account\` type represents a single user account
  type Account implements Node {
    _id: ID!
    addressBook: AddressConnection
    createdAt: DateTime!
    currency: Currency
    emailRecords: [EmailRecord]
    groups: GroupConnection
    metafields: [Metafield]
    name: String
    note: String
    preferences: JSONObject
    shop: Shop
    updatedAt: DateTime!
  }

  type AccountConnection implements NodeConnection {
    edges: [AccountEdge]
    nodes: [Account]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AccountEdge implements NodeEdge {
    cursor: String!
    node: [Account]
  }

  extend type Mutation {
    addAccountAddressBookEntry(accountId: ID, address: NewAddress!): Address
    addAccountEmailRecord(email: Email!): EmailRecord
    addAccountToGroup(accountId: ID!, groupId: ID!): Group
    removeAccountAddressBookEntry(accountId: ID, addressId: ID!): Address
    removeAccountEmailRecord(email: Email!): EmailRecord
    removeAccountFromGroup(accountId: ID!, groupId: ID!): Group
    updateAccount(accountId: ID!, modifier: UpdateAccountInput!): Account
    updateAccountAddressBookEntry(accountId: ID, addressId: ID!, modifier: UpdatedAddress!): Address
  }

  extend type Query {
    viewer: Account
    account(id: ID!): Account
    administrators(shopId: ID!): AccountConnection
  }
`;

/**
 * Changes going from account MongoDB schema to the GraphQL schema:
 * - acceptsMarketing is removed.
 * - sessions is removed.
 * - state attribute is removed.
 * - username attribute is removed.
 * - AccountProfile is removed.
 * - addressBook is merged from profile.
 * - currency is merged from profile.
 * - preferences is merged from profile.
 * - note attribute is only used in Shopify import.
 */
export const typeDefs = `
  enum AccountSortByField {
    _id
    name
    createdAt
    updatedAt
  }

  input UpdateAccountInput {
    currencyCode: String!
  }

  type TaxSettings {
    exemptionNo: String
    customerUsageType: String
  }

  # The \`Account\` type represents a single user account
  type Account implements Node {
    _id: ID!
    addressBook(after: ConnectionCursor, before: ConnectionCursor, first: Int, last: Int): AddressConnection
    createdAt: DateTime!
    currency: Currency
    emailRecords: [EmailRecord]
    groups(after: ConnectionCursor, before: ConnectionCursor, first: Int, last: Int): GroupConnection
    metafields: [Metafield]
    name: String
    note: String
    preferences: JSONObject
    shop: Shop
    taxSettings: TaxSettings
    updatedAt: DateTime!
  }

  type AccountConnection implements NodeConnection {
    edges: [AccountEdge]
    nodes: [Account]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AccountEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Account
  }

  extend type Mutation {
    addAccountAddressBookEntry(accountId: ID, address: AddressInput!): Address
    addAccountEmailRecord(email: Email!): EmailRecord
    addAccountToGroup(accountId: ID!, groupId: ID!): Group
    removeAccountAddressBookEntry(accountId: ID, addressId: ID!): Address
    removeAccountEmailRecord(email: Email!): EmailRecord
    removeAccountFromGroup(accountId: ID!, groupId: ID!): Group
    updateAccount(accountId: ID!, modifier: UpdateAccountInput!): Account
    updateAccountAddressBookEntry(accountId: ID, addressId: ID!, modifier: AddressInput!, type: AddressType): Address
  }

  extend type Query {
    viewer: Account
    account(id: ID!): Account
    administrators(shopId: ID!, after: ConnectionCursor, before: ConnectionCursor, first: Int, last: Int, sortOrder: SortOrder = asc, sortBy: AccountSortByField = createdAt): AccountConnection
  }
`;

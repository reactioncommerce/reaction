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
  # The fields by which you are allowed to sort any query that returns an \`AccountConnection\`
  enum AccountSortByField {
    _id
    name
    createdAt
    updatedAt
  }

  # The input object for mutating an existing \`Account\`
  input UpdateAccountInput {
    currencyCode: String!
  }

  # Per-account tax exemption settings used by the Avalara plugin
  type TaxSettings {
    exemptionNo: String
    customerUsageType: String
  }

  # Represents a single user account
  type Account implements Node {
    _id: ID!
    addressBook(after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt): AddressConnection
    createdAt: DateTime!
    currency: Currency
    emailRecords: [EmailRecord]
    groups(after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt): GroupConnection
    metafields: [Metafield]
    name: String
    note: String
    preferences: JSONObject
    shop: Shop
    taxSettings: TaxSettings
    updatedAt: DateTime!
  }

  # Wraps a list of \`Accounts\`, providing pagination cursors and information.
  type AccountConnection implements NodeConnection {
    edges: [AccountEdge]
    nodes: [Account]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A connection edge in which each node is an \`Account\` object
  type AccountEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Account
  }

  extend type Mutation {
    # Provide the ID of an \`Account\` and an \`AddressInput\` object. The address will be added to the \`addressBook\`
    # of that account, and the added \`Address\` object is returned.
    addAccountAddressBookEntry(accountId: ID!, address: AddressInput!): Address
    addAccountEmailRecord(email: Email!): EmailRecord
    addAccountToGroup(accountId: ID!, groupId: ID!): Group
    removeAccountAddressBookEntry(accountId: ID, addressId: ID!): Address
    removeAccountEmailRecord(email: Email!): EmailRecord
    removeAccountFromGroup(accountId: ID!, groupId: ID!): Group
    updateAccount(accountId: ID!, modifier: UpdateAccountInput!): Account
    updateAccountAddressBookEntry(accountId: ID, addressId: ID!, modifier: AddressInput!, type: AddressType): Address
  }

  extend type Query {
    # Returns the account for the authenticated user
    viewer: Account
    # Returns the account with the provided ID
    account(id: ID!): Account
    # Returns a list of administrators for the shop with ID \`shopId\`, as a Relay-compatible connection.
    # "Administrators" means all linked accounts that have the "admin" role for this shop.
    administrators(shopId: ID!, after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: AccountSortByField = createdAt): AccountConnection
  }
`;

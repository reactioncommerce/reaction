/* eslint-disable max-len */
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

  # Defines a new Address and the account to which it should be added
  input AddAccountAddressBookEntryInput {
    # The account ID
    accountId: ID!

    # The address to add
    address: AddressInput!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
  }

  # Describes changes that should be applied to one of the addresses for an account
  input UpdateAccountAddressBookEntryInput {
    # The account ID
    accountId: ID!

    # The address ID
    addressId: ID!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # If present, make this address the default address of this type
    type: AddressType

    # The address changes to apply
    updates: AddressInput!
  }

  # Describes which address should be removed from which account
  input RemoveAccountAddressBookEntryInput {
    # The account ID
    accountId: ID!

    # The address ID
    addressId: ID!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
  }

  # Describes an account profile currency change
  input SetAccountProfileCurrencyInput {
    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String

    # The currency code
    currencyCode: String!
  }

  # Defines a new Email and the account to which it should be added
  input AddAccountEmailRecordInput {
    # The account ID, which defaults to the viewer account
    accountId: ID

    # The email address to add
    email: Email!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
  }

  # Defines which email address should be removed from which account
  input RemoveAccountEmailRecordInput {
    # The account ID, which defaults to the viewer account
    accountId: ID

    # The email address to remove
    email: Email!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
  }

  # The input object for mutating an existing \`Account\`
  input AccountUpdatesInput {
    currencyCode: String!
  }

  # Defines how an account should be updated, and which account
  input UpdateAccountInput {
    # The account ID
    accountId: ID!

    # The field changes to apply
    updates: AccountUpdatesInput!

    # An optional string identifying the mutation call, which will be returned in the response payload
    clientMutationId: String
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

  # The response from the \`addAccountAddressBookEntry\` mutation
  type AddAccountAddressBookEntryPayload {
    # The added address
    address: Address

    # The added address edge
    addressEdge: AddressEdge

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`addAccountEmailRecord\` mutation
  type AddAccountEmailRecordPayload {
    # The added email record
    emailRecord: EmailRecord

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`removeAccountAddressBookEntry\` mutation
  type RemoveAccountAddressBookEntryPayload {
    # The removed address
    address: Address

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`removeAccountEmailRecord\` mutation
  type RemoveAccountEmailRecordPayload {
    # The account, with updated \`emailRecords\`
    account: Account

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`updateAccount\` mutation
  type UpdateAccountPayload {
    # The updated account
    account: Account

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`updateAccountAddressBookEntry\` mutation
  type UpdateAccountAddressBookEntryPayload {
    # The updated address
    address: Address

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  # The response from the \`setAccountProfileCurrency\` mutation
  type SetAccountProfileCurrencyPayload {
    # The updated account
    account: Account

    # The same string you sent with the mutation params, for matching mutation calls with their responses
    clientMutationId: String
  }

  extend type Mutation {
    # Provide the ID of an \`Account\` and an \`AddressInput\` object. The address will be added to the \`addressBook\`
    # of that account, and the added \`Address\` object is returned.
    addAccountAddressBookEntry(input: AddAccountAddressBookEntryInput!): AddAccountAddressBookEntryPayload
    addAccountEmailRecord(input: AddAccountEmailRecordInput!): AddAccountEmailRecordPayload
    removeAccountAddressBookEntry(input: RemoveAccountAddressBookEntryInput!): RemoveAccountAddressBookEntryPayload
    removeAccountEmailRecord(input: RemoveAccountEmailRecordInput!): RemoveAccountEmailRecordPayload
    setAccountProfileCurrency(input: SetAccountProfileCurrencyInput!): SetAccountProfileCurrencyPayload
    updateAccount(input: UpdateAccountInput!): UpdateAccountPayload
    updateAccountAddressBookEntry(input: UpdateAccountAddressBookEntryInput!): UpdateAccountAddressBookEntryPayload
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

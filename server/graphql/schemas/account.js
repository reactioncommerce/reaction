export const typeDefs = `
  input UpdateAccountInput {
    currency: String!
  }

  # Account.
  # NOTE: acceptsMarketing is removed.
  # NOTE: sessions is removed.
  # NOTE: state attribute is removed.
  # NOTE: taxSettings attribute is removed.
  # NOTE: username attribute is removed.
  # NOTE: AccountProfile is removed.
  # NOTE: addressBook is merged from profile.
  # NOTE: currency is merged from profile.
  # NOTE: preferences is merged from profile.
  # NOTE: note attribute is only used in Shopify import.
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
`;

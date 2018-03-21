export const typeDefs = `
  # Represents a Reaction shop
  type Shop implements Node {
    # The shop ID
    _id: ID!

    # Returns a list of administrators for this shop, as a Relay-compatible connection.
    # "Administrators" means all linked accounts that have the "admin" role for this shop.
    administrators(after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: AccountSortByField = createdAt): AccountConnection
  }

  extend type Mutation {
    inviteShopMember(shopId: ID!, email: String!, name: String!, groupId: ID!): Account
  }

  extend type Query {
    shop(id: ID!): Shop
  }
`;

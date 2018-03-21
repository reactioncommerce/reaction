export const typeDefs = `
  # TODO: Implement. Included to satisfy dependency in other types.
  type Shop implements Node {
    _id: ID!
    administrators(after: ConnectionCursor, before: ConnectionCursor, first: ConnectionLimitInt, last: ConnectionLimitInt, sortOrder: SortOrder = asc, sortBy: AccountSortByField = createdAt): AccountConnection
  }

  extend type Mutation {
    inviteShopMember(shopId: ID!, email: String!, name: String!, groupId: ID!): Account
  }

  extend type Query {
    shop(id: ID!): Shop
  }
`;

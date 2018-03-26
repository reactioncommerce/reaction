export const typeDefs = `
  # TODO: Implement. Included to satisfy dependency in other types.
  type Shop implements Node {
    _id: ID!
  }

  extend type Mutation {
    inviteShopMember(shopId: ID!, email: String!, name: String!, groupId: ID!): Account
  }
`;

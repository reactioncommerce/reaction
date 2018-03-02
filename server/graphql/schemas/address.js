export const typeDefs = `
  type Address {
    _id: ID!
    fullName: String!
    address1: String!
    address2: String
    city: String!
    company: String
    phone: String!
    region: String!
    postal: String!
    country: String!
    isCommercial: Boolean!
    isBillingDefault: Boolean!
    isShippingDefault: Boolean!
    failedValidation: Boolean
    metafields: [Metafield]
  }

  input AddressInput {
    fullName: String!
    address1: String!
    address2: String
    city: String!
    company: String
    phone: String!
    region: String!
    postal: String!
    country: String!
    isCommercial: Boolean!
    isBillingDefault: Boolean!
    isShippingDefault: Boolean!
    failedValidation: Boolean
    metafields: [MetafieldInput]
  }

  extend type Mutation {
    addressBookAdd(address: AddressInput!, accountUserId: ID, type: String): Int
  }
`;

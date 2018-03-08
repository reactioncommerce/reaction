export const typeDefs = `
  enum AddressType {
    billing
    shipping
  }

  input CreateAddressInput {
    address1: String!
    address2: String
    city: String!
    company: String
    country: String!
    failedValidation: Boolean
    fullName: String!
    isBillingDefault: Boolean!
    isCommercial: Boolean!
    isShippingDefault: Boolean!
    metafields: [CreateMetafieldInput]
    phone: String!
    postal: String!
    region: String!
  }

  input UpdateAddressInput {
    address1: String!
    address2: String
    city: String!
    company: String
    country: String!
    failedValidation: Boolean
    fullName: String!
    isBillingDefault: Boolean!
    isCommercial: Boolean!
    isShippingDefault: Boolean!
    metafields: [CreateMetafieldInput]
    phone: String!
    postal: String!
    region: String!
  }

  type Address implements Node {
    _id: ID!
    address1: String!
    address2: String
    city: String!
    company: String
    country: String!
    failedValidation: Boolean
    fullName: String!
    isBillingDefault: Boolean!
    isCommercial: Boolean!
    isShippingDefault: Boolean!
    metafields: [Metafield]
    phone: String!
    postal: String!
    region: String!
  }

  type AddressConnection implements NodeConnection {
    edges: [AddressEdge]
    nodes: [Address]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AddressEdge implements NodeEdge {
    cursor: String!
    node: [Address]
  }

  extend type Mutation {
    addressBookAdd(address: CreateAddressInput! accountUserId: ID, type: String): Boolean
  }
`;

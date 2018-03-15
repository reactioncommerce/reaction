export const typeDefs = `
  enum AddressType {
    billing
    shipping
  }

  input NewAddress {
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

  input UpdatedAddress {
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
    type: AddressType
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
`;

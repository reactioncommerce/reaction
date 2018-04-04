/**
 * Arguments passed by the client a groups query
 * @typedef {Object} AddressInput - Address
 * @property {String} address1 - Address line 1
 * @property {String} [address2] - Address line 2
 * @property {String} city - City
 * @property {String} [company] - Company name
 * @property {String} country - Country
 * @property {Boolean} [failedValidation] - Mark address as failed validation by address validation service
 * @property {String} fullName - Full name
 * @property {Boolean} isBillingDefault - Mark address as default for billing
 * @property {Boolean} isCommercial - Mask address as commercial
 * @property {Boolean} isShippingDefault -  Mark address as default for shipping
 * @property {Array<MetafieldInput>} metafields - Array of metafields
 * @property {String} phone - Phone number
 * @property {String} postal - Postal code
 * @property {String} region - Region of country
 */

export const typeDefs = `
  # A list of the possible types of \`Address\`
  enum AddressType {
    # Address can be used for payment transactions and invoicing
    billing

    # Address can be used as a mailing address for sending physical items
    shipping
  }

  # The details of an \`Address\` to be created or updated
  input AddressInput {
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
    metafields: [MetafieldInput]
    phone: String!
    postal: String!
    region: String!
  }

  # Represents a physical or mailing address somewhere on Earth
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

  # Wraps a list of \`Addresses\`, providing pagination cursors and information.
  type AddressConnection implements NodeConnection {
    edges: [AddressEdge]
    nodes: [Address]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A connection edge in which each node is an \`Address\` object
  type AddressEdge implements NodeEdge {
    cursor: ConnectionCursor!
    node: Address
  }
`;

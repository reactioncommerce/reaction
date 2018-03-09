export const typeDefs = `
  # An string email address.
  scalar Email

  # A confirmable email record.
  type EmailRecord {
    provides: String
    address: Email
    verified: Boolean
  }
`;

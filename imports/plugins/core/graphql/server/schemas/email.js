export const typeDefs = `
  # A string email address.
  scalar Email

  # A confirmable email record.
  type EmailRecord {
    provides: String
    address: Email
    verified: Boolean
  }
`;

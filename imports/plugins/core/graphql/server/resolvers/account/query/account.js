import { transformIdFromBase64 } from "@reactioncommerce/reaction-graphql-utils";
import { userAccountQuery } from "/imports/accounts/server/methods/userAccountQuery";

export default function account(_, { id }) {
  // search for user from the Accounts collection via provided Account ID

  // Trasform ID from base64
  // Returns an object. Use `.id` to get ID
  const idFromBase64 = transformIdFromBase64(id);

  // Pass Id into userAccountQuery function
  const userAccount = userAccountQuery(idFromBase64.id);

  // Return result of userAccountQuery()
  return userAccount;
}

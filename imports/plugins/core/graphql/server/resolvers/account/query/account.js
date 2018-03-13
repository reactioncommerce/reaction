import { Accounts } from "/lib/collections";
import { transformIdFromBase64 } from "@reactioncommerce/reaction-graphql-utils";

export default function account(_, { id }) {
  // search for user from the Accounts collection via provided Account ID

  // Trasform ID from base64
  // Returns an object. Use `.id` to get ID
  const idFromBase64 = transformIdFromBase64(id);

  const userAccount = Accounts.findOne({
    _id: idFromBase64.id
  });

  if (!userAccount) throw new Error("No account found");

  return userAccount;
}

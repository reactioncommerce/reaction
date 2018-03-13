import { Accounts } from "/lib/collections";
import { Reaction } from "/lib/api";

export default function userAccountQuery(id) {

  // Query the accounts collection to find user by ID
  const userAccount = Accounts.findOne({
    _id: id
  });

  // If user is not found, throw an error
  if (!userAccount) throw new Error("No account found");

  // If account is found, return userAccount
  return userAccount;
}

import { Accounts } from "/lib/collections";
import { Reaction } from "/lib/api";

export default function userAccountQuery(id) {
  // Check to make sure current user has permissions to view queried user
  if (!Reaction.hasPermission("reaction-accounts")) throw new Error("User does not have permission");

  // Query the accounts collection to find user by ID
  const userAccount = Accounts.findOne({
    _id: id
  });

  // If user is not found, throw an error
  if (!userAccount) throw new Error("No account found");

  // If account is found, return userAccount
  return userAccount;
}

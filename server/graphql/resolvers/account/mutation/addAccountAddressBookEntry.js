import { namespaces, runMeteorMethodWithContext, transformIdFromBase64, transformIdToBase64 } from "../util";

export default function addAccountAddressBookEntry(_, { accountId, input }, context) {
  const dbAccountId = transformIdFromBase64(accountId);
  const result = runMeteorMethodWithContext(context, "accounts/addressBookAdd", [input, dbAccountId]);
  result._id = transformIdToBase64(namespaces.Account, result._id);
  return result;
}

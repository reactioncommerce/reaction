import { namespaces, runMeteorMethodWithContext, transformIdFromBase64, transformIdToBase64 } from "../../util";

export default function addAccountAddressBookEntry(_, { accountId, address }, context) {
  const { id: dbAccountId } = transformIdFromBase64(accountId);
  const result = runMeteorMethodWithContext(context, "accounts/addressBookAdd", [address, dbAccountId]);
  result._id = transformIdToBase64(namespaces.Account, result._id);
  return result;
}

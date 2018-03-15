import { namespaces, runMeteorMethodWithContext, transformIdFromBase64, transformIdToBase64 } from "../../util";

export default function updateAccountAddressBookEntry(_, { accountId, addressId, modifier }, context) {
  const { type, ...address } = modifier;
  address._id = transformIdFromBase64(addressId);
  const result = runMeteorMethodWithContext(context, "accounts/addressBookAdd", [address, transformIdFromBase64(accountId), type]);
  result._id = transformIdToBase64(namespaces.Account, result._id);
  return result;
}

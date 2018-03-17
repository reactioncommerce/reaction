import { namespaces, runMeteorMethodWithContext } from "../../util";
import { decodeOpaqueId, encodeOpaqueId } from "../../xforms/id";

export default function updateAccountAddressBookEntry(_, { accountId, addressId, modifier }, context) {
  const { type, ...address } = modifier;
  address._id = decodeOpaqueId(addressId);
  const result = runMeteorMethodWithContext(context, "accounts/addressBookAdd", [address, decodeOpaqueId(accountId), type]);
  result._id = encodeOpaqueId(namespaces.Account, result._id);
  return result;
}

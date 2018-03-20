import { namespaces, runMeteorMethodWithContext } from "../../util";
import { decodeOpaqueId, encodeOpaqueId } from "../../xforms/id";

export default function addAccountAddressBookEntry(_, { accountId, address }, context) {
  const { id: dbAccountId } = decodeOpaqueId(accountId);
  const result = runMeteorMethodWithContext(context, "accounts/addressBookAdd", [address, dbAccountId]);
  result._id = encodeOpaqueId(namespaces.Account, result._id);
  return result;
}

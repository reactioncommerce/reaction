import { Meteor } from "meteor/meteor";
import { transformIdToBase64 } from "../../util";
import addAccountAddressBookEntry from "./addAccountAddressBookEntry";

test("correctly passes through to accounts/addressBookAdd method", () => {
  const accountId = transformIdToBase64("Account", "1");
  const address = { address1: "123 Main St" };

  const fakeResult = { _id: "1", ...address };
  Meteor.apply.mockReturnValueOnce(fakeResult);

  const expectedResult = { _id: accountId, ...address };

  const context = { a: 1 };
  const result = addAccountAddressBookEntry(null, {
    accountId,
    address
  }, context);

  expect(result).toEqual(expectedResult);
});

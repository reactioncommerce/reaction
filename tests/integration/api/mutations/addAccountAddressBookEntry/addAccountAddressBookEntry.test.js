import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import AddAccountAddressBookEntryMutation from "./AddAccountAddressBookEntryMutation.graphql";

jest.setTimeout(300000);

let testApp;
let addAccountAddressBookEntry;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop();
  addAccountAddressBookEntry = testApp.mutate(AddAccountAddressBookEntryMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

const accountInternalId = "123";
const accountOpaqueId = "cmVhY3Rpb24vYWNjb3VudDoxMjM=";

test("user can add an address to their own address book", async () => {
  await testApp.setLoggedInUser({ _id: accountInternalId });

  const address = Factory.AccountProfileAddress.makeOne();

  // These props are set by the server and not allowed on AddressInput
  delete address._id;
  delete address.failedValidation;

  let result;
  try {
    result = await addAccountAddressBookEntry({ accountId: accountOpaqueId, address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addAccountAddressBookEntry.address).toEqual(address);

  const account = await testApp.collections.Accounts.findOne({ userId: accountInternalId });
  const savedAddress = account.profile.addressBook[0];
  delete savedAddress._id;
  expect(savedAddress).toEqual(address);
});

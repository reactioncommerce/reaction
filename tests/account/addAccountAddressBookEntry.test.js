import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";
import AddAccountAddressBookEntryMutation from "./AddAccountAddressBookEntryMutation.graphql";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let testApp;
let addAccountAddressBookEntry;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop();
  addAccountAddressBookEntry = testApp.mutate(AddAccountAddressBookEntryMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.remove({});
  testApp.stop();
});

test("user can add an address to their own address book", async () => {
  await testApp.setLoggedInUser({ _id: "123" });

  const address = Factory.Address.makeOne();

  let result;
  try {
    result = await addAccountAddressBookEntry({ accountId: "123", address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.account.addressBook.length).toBe(1);
  expect(result.account.addressBook[0]).toEqual(address);

  const account = await testApp.collections.Accounts.findOne({ _id: "123" });
  expect(account.addressBook[0]).toEqual(address);
});

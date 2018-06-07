import GraphTester from "../GraphTester";
import Factory from "/imports/test-utils/helpers/factory";
import AddAccountAddressBookEntryMutation from "./AddAccountAddressBookEntryMutation.graphql";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let tester;
let addAccountAddressBookEntry;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.start();
  await tester.insertPrimaryShop();
  addAccountAddressBookEntry = tester.mutate(AddAccountAddressBookEntryMutation);
});

afterAll(async () => {
  await tester.collections.Shops.remove({});
  tester.stop();
});

test("user can add an address to their own address book", async () => {
  await tester.setLoggedInUser({ _id: "123" });

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

  const account = await tester.collections.Accounts.findOne({ _id: "123" });
  expect(account.addressBook[0]).toEqual(address);
});

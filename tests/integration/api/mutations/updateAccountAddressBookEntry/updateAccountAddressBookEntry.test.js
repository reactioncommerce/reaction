import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateAccountAddressBookEntryMutation = importAsString("./UpdateAccountAddressBookEntryMutation.graphql");
const address = Factory.AccountProfileAddress.makeOne({
  _id: "address1"
});
const addressOpaqueId = encodeOpaqueId("reaction/address", address._id);
const addressUpdateInput = {
  address1: "302 Main Street",
  address2: "#202",
  city: "Santa Monica",
  company: "Reaction Commerce Inc",
  country: "US",
  fullName: "my full name",
  isBillingDefault: true,
  isCommercial: true,
  isShippingDefault: true,
  phone: "3105202522",
  postal: "94524",
  region: "CA"
};

jest.setTimeout(300000);

let testApp;
let updateAccountAddressBookEntry;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  updateAccountAddressBookEntry = testApp.mutate(UpdateAccountAddressBookEntryMutation);
  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [],
    roles: { [shopId]: ["owner", "admin"] },
    profile: {
      addressBook: [address]
    },
    shopId
  });

  accountOpaqueId = encodeOpaqueId("reaction/account", mockUserAccount._id);


  await testApp.createUserAndAccount(mockUserAccount);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can not update account address if not logged in", async () => {
  try {
    await updateAccountAddressBookEntry({
      input: {
        accountId: accountOpaqueId,
        addressId: addressOpaqueId,
        updates: addressUpdateInput
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user can update account address", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await updateAccountAddressBookEntry({
      input: {
        accountId: accountOpaqueId,
        addressId: addressOpaqueId,
        updates: addressUpdateInput
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.updateAccountAddressBookEntry.address).toEqual(addressUpdateInput);
});

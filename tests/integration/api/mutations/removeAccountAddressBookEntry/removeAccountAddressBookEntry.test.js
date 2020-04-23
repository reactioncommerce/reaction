import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const RemoveAccountAddressBookEntryMutation = importAsString("./RemoveAccountAddressBookEntryMutation.graphql");

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
const address = Factory.AccountProfileAddress.makeOne({
  _id: "address1",
  ...addressUpdateInput
});
const addressOpaqueId = encodeOpaqueId("reaction/address", address._id);


jest.setTimeout(300000);

let testApp;
let removeAccountAddressBookEntry;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);

  const customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  removeAccountAddressBookEntry = testApp.mutate(RemoveAccountAddressBookEntryMutation);
  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [customerGroup._id],
    profile: {
      addressBook: [address]
    },
    shopId
  });

  accountOpaqueId = encodeOpaqueId("reaction/account", mockUserAccount._id);


  await testApp.createUserAndAccount(mockUserAccount);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can not delete account address if not logged in", async () => {
  try {
    await removeAccountAddressBookEntry({
      input: {
        accountId: accountOpaqueId,
        addressId: addressOpaqueId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user can delete account address", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await removeAccountAddressBookEntry({
      input: {
        accountId: accountOpaqueId,
        addressId: addressOpaqueId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.removeAccountAddressBookEntry.address).toEqual(addressUpdateInput);
});

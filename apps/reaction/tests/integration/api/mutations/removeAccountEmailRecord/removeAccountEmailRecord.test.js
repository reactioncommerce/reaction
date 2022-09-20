import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const RemoveAccountEmailRecordMutation = importAsString("./RemoveAccountEmailRecordMutation.graphql");
const mockEmails = [
  {
    address: "default@mockemail.com",
    provides: "default",
    verified: false
  }, {
    address: "not-default@mockemail.com",
    verified: false
  }
];

jest.setTimeout(300000);

let testApp;
let removeAccountEmailRecord;
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
  removeAccountEmailRecord = testApp.mutate(RemoveAccountEmailRecordMutation);

  const customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    emails: mockEmails,
    groups: [customerGroup._id],
    profile: {
      language: "en"
    },
    shopId
  });

  accountOpaqueId = encodeOpaqueId("reaction/account", mockUserAccount._id);

  await testApp.createUserAndAccount(mockUserAccount);
});

beforeEach(async () => {
  await testApp.collections.Accounts.updateOne({ _id: mockUserAccount._id }, {
    $set: {
      emails: mockEmails
    }
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can not remove account email if not logged in", async () => {
  try {
    await removeAccountEmailRecord({
      input: { accountId: accountOpaqueId, email: mockEmails[0].address }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user cannot remove default account email", async () => {
  await testApp.setLoggedInUser(mockUserAccount);
  try {
    await removeAccountEmailRecord({
      input: { accountId: accountOpaqueId, email: mockEmails[0].address }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("user can remove non-default account email", async () => {
  await testApp.setLoggedInUser(mockUserAccount);
  let result;
  try {
    result = await removeAccountEmailRecord({
      input: { accountId: accountOpaqueId, email: mockEmails[1].address }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.removeAccountEmailRecord.account.emailRecords.length).toEqual(1);
  expect(result.removeAccountEmailRecord.account.emailRecords).toEqual([{
    address: mockEmails[0].address
  }]);
});

test("accountId is optional and defaults to calling account", async () => {
  await testApp.setLoggedInUser(mockUserAccount);
  let result;
  try {
    result = await removeAccountEmailRecord({
      input: { email: mockEmails[1].address }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.removeAccountEmailRecord.account.emailRecords.length).toEqual(1);
  expect(result.removeAccountEmailRecord.account.emailRecords).toEqual([{
    address: mockEmails[0].address
  }]);
});

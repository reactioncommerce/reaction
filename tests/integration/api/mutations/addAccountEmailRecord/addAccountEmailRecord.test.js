import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddAccountEmailRecordMutation = importAsString("./AddAccountEmailRecordMutation.graphql");

jest.setTimeout(300000);

let testApp;
let addAccountEmailRecord;
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
  addAccountEmailRecord = testApp.mutate(AddAccountEmailRecordMutation);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [],
    profile: {
      language: "en"
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

test("user can add an email to their own account", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  const email = {
    address: "new@mockemail.com",
    verified: false
  };

  let result;
  try {
    result = await addAccountEmailRecord({ accountId: accountOpaqueId, email: email.address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const resultEmail = result.addAccountEmailRecord.account.emailRecords.pop();

  expect(resultEmail).toEqual(email);
});

test("accountId is optional and defaults to calling account", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  const email = {
    address: "new-two@mockemail.com",
    verified: false
  };

  let result;
  try {
    result = await addAccountEmailRecord({ email: email.address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addAccountEmailRecord.account._id).toBe(accountOpaqueId);
  expect(result.addAccountEmailRecord.account.emailRecords.pop()).toEqual(email);
});

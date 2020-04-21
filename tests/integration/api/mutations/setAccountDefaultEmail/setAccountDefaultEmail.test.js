import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const SetAccountDefaultEmailMutation = importAsString("./SetAccountDefaultEmailMutation.graphql");

jest.setTimeout(300000);

let testApp;
let setAccountDefaultEmail;
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
  setAccountDefaultEmail = testApp.mutate(SetAccountDefaultEmailMutation);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [],
    emails: [
      {
        address: "original-default@email.com",
        provides: "default",
        verified: false
      }, {
        address: "other@email.com",
        verified: false
      }
    ],
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
      emails: [
        {
          address: "original-default@email.com",
          provides: "default",
          verified: false
        }, {
          address: "other@email.com",
          verified: false
        }
      ]
    }
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user can set default email on their own account if address already exists", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await setAccountDefaultEmail({ accountId: accountOpaqueId, email: mockUserAccount.emails[1].address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const resultEmails = result.setAccountDefaultEmail.account.emailRecords;
  const newDefaultEmail = resultEmails.find(({ provides }) => provides === "default");
  const oldDefaultEmail = resultEmails.find(({ provides }) => provides !== "default");

  expect(newDefaultEmail.address).toEqual(mockUserAccount.emails[1].address);
  expect(oldDefaultEmail.address).toEqual(mockUserAccount.emails[0].address);
});

test("accountId is optional and defaults to calling account", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await setAccountDefaultEmail({ email: mockUserAccount.emails[1].address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const resultEmails = result.setAccountDefaultEmail.account.emailRecords;
  const newDefaultEmail = resultEmails.find(({ provides }) => provides === "default");
  const oldDefaultEmail = resultEmails.find(({ provides }) => provides !== "default");

  expect(newDefaultEmail.address).toEqual(mockUserAccount.emails[1].address);
  expect(oldDefaultEmail.address).toEqual(mockUserAccount.emails[0].address);
});

test("user cannot set default email on their own account if address doesn't already exist", async () => {
  await testApp.setLoggedInUser(mockUserAccount);
  try {
    await setAccountDefaultEmail({ accountId: accountOpaqueId, email: "invalid@email.com" });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user cannot update default email if provided address is already default email", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  try {
    await setAccountDefaultEmail({ accountId: accountOpaqueId, email: "original-default@email.com" });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

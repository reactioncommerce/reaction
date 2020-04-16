import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const UpdateAccountMutation = importAsString("./UpdateAccountMutation.graphql");

jest.setTimeout(300000);

let testApp;
let updateAccount;
let mockAdminUserAccount;
let mockOtherUserAccount;
let adminAccountOpaqueId;
let otherAccountOpaqueId;
let adminGroup;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  await insertPrimaryShop(testApp.context);
  updateAccount = testApp.mutate(UpdateAccountMutation);

  adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:accounts/update"],
    slug: "admin",
    shopId: null // global permission group
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockAdminUserAccount = Factory.Account.makeOne({
    _id: "mockAdminUserId",
    groups: ["adminGroup"]
  });
  adminAccountOpaqueId = encodeOpaqueId("reaction/account", mockAdminUserAccount._id);
  await testApp.createUserAndAccount(mockAdminUserAccount);

  mockOtherUserAccount = Factory.Account.makeOne({ _id: "mockOtherUserId" });
  otherAccountOpaqueId = encodeOpaqueId("reaction/account", mockOtherUserAccount._id);
  await testApp.createUserAndAccount(mockOtherUserAccount);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can update their own account", async () => {
  await testApp.setLoggedInUser(mockOtherUserAccount);

  let result;
  try {
    result = await updateAccount({
      input: {
        accountId: otherAccountOpaqueId,
        currencyCode: "USD",
        language: "en",
        firstName: "FIRST",
        lastName: "LAST",
        name: "FIRST LAST",
        note: "This is a note",
        username: "emanresu",
        picture: "https://foo.bar.com/me.jpg",
        bio: "Test account"
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateAccount.account).toEqual({
    currency: { code: "USD" },
    language: "en",
    firstName: "FIRST",
    lastName: "LAST",
    name: "FIRST LAST",
    note: "This is a note",
    username: "emanresu",
    picture: "https://foo.bar.com/me.jpg",
    bio: "Test account"
  });
});

test("accounts admin can update any other account", async () => {
  await testApp.setLoggedInUser(mockAdminUserAccount);

  let result;
  try {
    result = await updateAccount({
      input: {
        accountId: otherAccountOpaqueId,
        currencyCode: "USD",
        language: "en",
        firstName: "FIRST",
        lastName: "LAST",
        name: "FIRST LAST",
        note: "This is a note",
        username: "emanresu",
        picture: "https://foo.bar.com/me.jpg",
        bio: "Test account"
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateAccount.account).toEqual({
    currency: { code: "USD" },
    language: "en",
    firstName: "FIRST",
    lastName: "LAST",
    name: "FIRST LAST",
    note: "This is a note",
    username: "emanresu",
    picture: "https://foo.bar.com/me.jpg",
    bio: "Test account"
  });
});

test("user cannot update an account if not logged in", async () => {
  try {
    await updateAccount({
      input: { accountId: otherAccountOpaqueId, currencyCode: "INR" }
    });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});

test("user cannot update another account if they don't have permission", async () => {
  await testApp.setLoggedInUser(mockOtherUserAccount);

  try {
    await updateAccount({
      input: { accountId: adminAccountOpaqueId, currencyCode: "INR" }
    });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});

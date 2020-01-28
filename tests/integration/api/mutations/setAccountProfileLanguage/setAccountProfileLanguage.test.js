import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const SetAccountProfileLanguageMutation = importAsString("./SetAccountProfileLanguageMutation.graphql");

jest.setTimeout(300000);

let testApp;
let setAccountProfileLanguage;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop({
    languages: [
      { label: "mockLabel", i18n: "mockI18n", enabled: false },
      { label: "English", i18n: "EN", enabled: true }
    ]
  });
  setAccountProfileLanguage = testApp.mutate(SetAccountProfileLanguageMutation);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:accounts/update:language"],
    slug: "admin"
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [adminGroup._id]
  });

  accountOpaqueId = encodeOpaqueId("reaction/account", mockUserAccount._id);

  await testApp.createUserAndAccount(mockUserAccount, ["reaction:legacy:accounts/update:language"]);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can set account profile language", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  let result;
  try {
    result = await setAccountProfileLanguage({
      input: { accountId: accountOpaqueId, language: "EN" }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.setAccountProfileLanguage.account.language).toEqual("EN");
});

test("user cannot set account profile language if its not enabled", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  try {
    await setAccountProfileLanguage({
      input: { accountId: accountOpaqueId, language: "mockI18n" }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user can not set account profile language if not logged in", async () => {
  try {
    await setAccountProfileLanguage({
      input: { accountId: accountOpaqueId, language: "INR" }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

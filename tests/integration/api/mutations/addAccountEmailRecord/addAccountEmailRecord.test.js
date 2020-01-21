import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AddAccountEmailRecordMutation = importAsString("./AddAccountEmailRecordMutation.graphql");

jest.setTimeout(300000);

let testApp;
let addAccountEmailRecord;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  addAccountEmailRecord = testApp.mutate(AddAccountEmailRecordMutation);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    groups: [],
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

test("user can add an email to their own account", async () => {
  await testApp.setLoggedInUser(mockUserAccount);

  const email = Factory.Email.makeOne();

  // _id is set by the server, true
  delete email._id;

  let result;
  try {
    result = await addAccountEmailRecord({ accountId: accountOpaqueId, email: email.address });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addAccountEmailRecord.account.emailRecords.pop()).toEqual(email);
});

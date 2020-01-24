import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const RemoveAccountEmailRecordMutation = importAsString("./RemoveAccountEmailRecordMutation.graphql");
const mockEmails = Factory.Email.makeMany(2);

jest.setTimeout(300000);

let testApp;
let removeAccountEmailRecord;
let shopId;
let mockUserAccount;
let accountOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  removeAccountEmailRecord = testApp.mutate(RemoveAccountEmailRecordMutation);

  mockUserAccount = Factory.Account.makeOne({
    _id: "mockUserId",
    emails: mockEmails,
    groups: [],
    roles: { [shopId]: ["owner", "admin"] },
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

test("user can not set account email if not logged in", async () => {
  try {
    await removeAccountEmailRecord({
      input: { accountId: accountOpaqueId, email: mockEmails[0].address }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("user can remove account email", async () => {
  await testApp.setLoggedInUser(mockUserAccount);
  let result;
  try {
    result = await removeAccountEmailRecord({
      input: { accountId: accountOpaqueId, email: mockEmails[0].address }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.removeAccountEmailRecord.account.emailRecords.length).toEqual(1);
  expect(result.removeAccountEmailRecord.account.emailRecords).toEqual([{
    address: mockEmails[1].address
  }]);
});


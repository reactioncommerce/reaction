import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import AddAccountEmailRecordMutation from "./AddAccountEmailRecordMutation.graphql";

jest.setTimeout(300000);

let testApp;
let addAccountEmailRecord;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop();
  addAccountEmailRecord = testApp.mutate(AddAccountEmailRecordMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

const accountInternalId = "123";
const accountOpaqueId = "cmVhY3Rpb24vYWNjb3VudDoxMjM=";

test("user can add an email to their own account", async () => {
  await testApp.setLoggedInUser({ _id: accountInternalId });

  const email = Factory.Email.makeOne();

  // _id is set by the server
  delete email._id;

  let result;
  try {
    result = await addAccountEmailRecord({ accountId: accountOpaqueId, email });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addAccountEmailRecord.emailRecord).toEqual(email);
});

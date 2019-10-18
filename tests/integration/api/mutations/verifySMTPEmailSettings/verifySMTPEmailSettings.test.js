import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import VerifySMTPEmailSettingsMutation from "./verifySMTPEmailSettings.graphql";

jest.mock("@reactioncommerce/nodemailer", () =>
  ({
    __esModule: true,
    default: {
      createTransport: jest.fn().mockImplementation(() => ({
        verify: jest.fn().mockImplementation(() => true)
      }))
    }
  }));

jest.setTimeout(300000);

let verifySMTPEmailSettings;
let mockAdminAccount;
let shopId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    roles: {
      [shopId]: ["admin", "shopManagerGroupPermission", "someOtherPermission", "customerGroupPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  verifySMTPEmailSettings = testApp.mutate(VerifySMTPEmailSettingsMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("test if email config data is verified by nodemailer", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await verifySMTPEmailSettings({
    input: {
      host: "test.email.com",
      port: 22,
      service: "custom",
      shopId,
      password: "test",
      user: "user"
    }
  });

  expect(result.verifySMTPEmailSettings.isVerified).toBe(true);
});

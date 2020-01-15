import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const VerifySMTPEmailSettingsMutation = importAsString("./verifySMTPEmailSettings.graphql");

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
      [shopId]: ["reaction:legacy:emails/read"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  verifySMTPEmailSettings = testApp.mutate(VerifySMTPEmailSettingsMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("test if email config data is verified by nodemailer", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await verifySMTPEmailSettings({
    input: {
      shopId
    }
  });

  expect(result.verifySMTPEmailSettings.isVerified).toBe(true);
});

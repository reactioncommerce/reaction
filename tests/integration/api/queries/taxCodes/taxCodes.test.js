import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const TaxCodesQuery = importAsString("./TaxCodesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let taxCodes;

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["owner"]
  },
  shopId: internalShopId
});

beforeAll(async () => {
  testApp = new TestApp();

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount);
  taxCodes = testApp.query(TaxCodesQuery);

  await testApp.setLoggedInUser(mockAdminAccount);
  testApp.registerPlugin({
    label: "Custom Rates",
    name: "reaction-taxes-rates",
    taxServices: [
      {
        displayName: "Custom Rates",
        name: "custom-rates",
        functions: {
          getTaxCodes: () => ([{
            code: "RC_TAX",
            label: "Taxable (RC_TAX)"
          }])
        }
      }
    ]
  });
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("an admin user can view tax codes", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await taxCodes({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  console.log(JSON.stringify(result, null, 2));
});

import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const RolesQuery = importAsString("./RolesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let roles;

const mockShopOwnerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["owner"]
  },
  shopId: internalShopId
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await testApp.createUserAndAccount(mockShopOwnerAccount);
  roles = testApp.query(RolesQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("an anonymous user cannot view user roles ", async () => {
  try {
    await roles({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("a shop owner can view all user roles", async () => {
  let result;
  await testApp.setLoggedInUser(mockShopOwnerAccount);

  try {
    result = await roles({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.roles.nodes[0].name).toEqual("account/enroll");
});

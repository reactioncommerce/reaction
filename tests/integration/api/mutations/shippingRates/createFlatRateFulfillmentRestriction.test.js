import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateFlatRateFulfillmentRestrictionMutation = importAsString("./CreateFlatRateFulfillmentRestrictionMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let createFlatRateFulfillmentRestriction;
let testApp;

const mockFulfillmentRestrictionInput = {
  methodIds: [],
  type: "allow",
  destination: {
    country: ["US"],
    postal: ["90817"],
    region: ["CA"]
  },
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ]
};

const mockOwnerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["owner"]
  },
  shopId: internalShopId
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockOwnerAccount);
  createFlatRateFulfillmentRestriction = testApp.mutate(CreateFlatRateFulfillmentRestrictionMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.FlatRateFulfillmentRestrictions.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("shop owner cannot update flat rate fulfillment restriction if not logged in", async () => {
  try {
    await createFlatRateFulfillmentRestriction({
      input: {
        shopId: opaqueShopId,
        restriction: mockFulfillmentRestrictionInput
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

test("shop owner can update flat rate fulfillment restriction", async () => {
  let result;
  await testApp.setLoggedInUser(mockOwnerAccount);

  try {
    result = await createFlatRateFulfillmentRestriction({
      input: {
        shopId: opaqueShopId,
        restriction: mockFulfillmentRestrictionInput
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.createFlatRateFulfillmentRestriction.restriction).toMatchObject({
    _id: expect.any(String),
    shopId: opaqueShopId,
    ...mockFulfillmentRestrictionInput
  });
});

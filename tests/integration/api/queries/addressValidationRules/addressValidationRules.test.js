import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const addressValidationRulesQuery = importAsString("./addressValidationRules.graphql");

jest.setTimeout(300000);

function mongoToGql(rules) {
  return rules.map((rule) => ({
    ...rule,
    _id: encodeOpaqueId("reaction/addressValidationRule", rule._id),
    shopId: encodeOpaqueId("reaction/shop", rule.shopId),
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString()
  }));
}

let getAddressValidationRules;
let mockAdminAccount;
let mockNonAdminAccount;
let opaqueShopId;
let opaqueOtherShopId;
let rules;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  const shopId = await testApp.insertPrimaryShop();
  opaqueShopId = encodeOpaqueId("reaction/shop", shopId);

  const mockShop = Factory.Shop.makeOne({
    currency: "USD",
    name: "Other Shop",
    shopType: "merchant",
    slug: "other-shop"
  });

  const { insertedId } = await testApp.collections.Shops.insertOne(mockShop);
  opaqueOtherShopId = encodeOpaqueId("reaction/shop", insertedId);

  mockAdminAccount = Factory.Account.makeOne({
    roles: {
      [shopId]: ["reaction:legacy:addressValidationRules/read"],
      [insertedId]: ["reaction:legacy:addressValidationRules/read"]
    }
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockNonAdminAccount = Factory.Account.makeOne();
  await testApp.createUserAndAccount(mockNonAdminAccount);

  getAddressValidationRules = testApp.query(addressValidationRulesQuery);

  // Create mock rules
  rules = Factory.AddressValidationRule.makeMany(4, {
    serviceName: (index) => `service${index + 1}`,
    shopId
  });
  await testApp.collections.AddressValidationRules.insertMany(rules);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.AddressValidationRules.deleteMany({});
  await testApp.stop();
});

test("unauthenticated", async () => {
  await testApp.clearLoggedInUser();

  try {
    await getAddressValidationRules({ shopId: opaqueShopId });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }
});

test("authenticated as non-admin", async () => {
  await testApp.setLoggedInUser(mockNonAdminAccount);

  try {
    await getAddressValidationRules({ shopId: opaqueShopId });
  } catch (errors) {
    expect(errors[0].message).toBe("Access Denied");
  }

  await testApp.clearLoggedInUser();
});

test("authenticated as admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  // Default sortBy is createdAt ascending
  rules.sort((item1, item2) => {
    if (item1.createdAt > item2.createdAt) return 1;
    if (item1.createdAt < item2.createdAt) return -1;
    return 0;
  });

  const gqlRules = mongoToGql(rules);

  // Simple
  const { addressValidationRules: { nodes: defaultNodes } } = await getAddressValidationRules({ shopId: opaqueShopId });
  expect(defaultNodes).toEqual(gqlRules);

  // Limit
  const { addressValidationRules: { nodes: limitNodes } } = await getAddressValidationRules({ shopId: opaqueShopId, first: 1 });
  expect(limitNodes.length).toBe(1);
  expect(limitNodes[0]._id).toBe(gqlRules[0]._id);

  // Offset
  const { addressValidationRules: { nodes: offsetNodes } } = await getAddressValidationRules({ shopId: opaqueShopId, first: 1, offset: 1 });
  expect(offsetNodes.length).toBe(1);
  expect(offsetNodes[0]._id).toBe(gqlRules[1]._id);

  // Service name filter
  const { addressValidationRules: { nodes: serviceNameNodes } } = await getAddressValidationRules({ serviceNames: ["service1"], shopId: opaqueShopId });
  expect(serviceNameNodes.length).toBe(1);
  expect(serviceNameNodes[0].serviceName).toBe("service1");

  // Shop filter
  const { addressValidationRules: { nodes: shopNodes } } = await getAddressValidationRules({ shopId: opaqueOtherShopId });
  expect(shopNodes.length).toBe(0);

  await testApp.clearLoggedInUser();
});

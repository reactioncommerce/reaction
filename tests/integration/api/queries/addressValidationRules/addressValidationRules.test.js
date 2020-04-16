import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

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
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  const shopId = await insertPrimaryShop(testApp.context);
  opaqueShopId = encodeOpaqueId("reaction/shop", shopId);

  const mockShop = Factory.Shop.makeOne({
    currency: "USD",
    name: "Other Shop",
    shopType: "merchant",
    slug: "other-shop"
  });

  const { insertedId } = await testApp.collections.Shops.insertOne(mockShop);
  opaqueOtherShopId = encodeOpaqueId("reaction/shop", insertedId);

  const adminGroupShopOne = Factory.Group.makeOne({
    _id: "adminGroupOne",
    createdBy: null,
    name: "adminOne",
    permissions: ["reaction:legacy:addressValidationRules/read"],
    slug: "adminOne",
    shopId
  });
  const adminGroupShopTwo = Factory.Group.makeOne({
    _id: "adminGroupTwo",
    createdBy: null,
    name: "adminTwo",
    permissions: ["reaction:legacy:addressValidationRules/read"],
    slug: "adminTwo",
    shopId: insertedId
  });

  await testApp.collections.Groups.insertOne(adminGroupShopOne);
  await testApp.collections.Groups.insertOne(adminGroupShopTwo);

  mockAdminAccount = Factory.Account.makeOne({
    groups: ["adminGroupOne", "adminGroupTwo"]
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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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

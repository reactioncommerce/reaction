import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const GenerateSitemapsMutation = importAsString("./generateSitemaps.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const shopName = "Test Shop";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shops/update"],
  slug: "admin",
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId
});

let testApp;
let generateSitemaps;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  generateSitemaps = testApp.mutate(GenerateSitemapsMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Jobs.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.stop();
});

test("generate sitemaps", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await generateSitemaps({
      input: {
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const createdJob = await testApp.collections.Jobs.findOne({
    "type": "sitemaps/generate",
    "data.shopId": shopId
  });

  expect(createdJob.data.shopId).toEqual(shopId);
  expect(result.generateSitemaps.wasJobScheduled).toEqual(true);
});

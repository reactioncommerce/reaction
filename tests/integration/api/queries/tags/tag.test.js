import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const TagQuery = importAsString("./TagQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const mockTags = Factory.Tag.makeMany(25, {
  _id: (index) => (index + 100).toString(),
  position: (index) => index + 100,
  shopId: internalShopId,
  slug: (index) => `slug${index + 100}`,
  isVisible: (index) => index < 20
});

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:tags/read:invisible"],
  slug: "admin",
  shopId: internalShopId
});

const customerGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["customer"],
  slug: "customer",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const mockCustomerAccount = Factory.Account.makeOne({
  groups: [customerGroup._id],
  shopId: internalShopId
});

let testApp;
let query;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  query = testApp.query(TagQuery);

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await Promise.all(mockTags.map((tag) => testApp.collections.Tags.insertOne(tag)));

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockCustomerAccount);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("should get a tag by ID", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  const tagId = encodeOpaqueId("reaction/tag", "101");
  let result;
  try {
    result = await query({
      slugOrId: tagId,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tag._id).toEqual(tagId);
  expect(result.tag.slug).toEqual("slug101");
});

test("should get a tag by slug", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  let result;
  try {
    result = await query({
      slugOrId: "slug106",
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tag._id).toEqual(encodeOpaqueId("reaction/tag", "106"));
  expect(result.tag.slug).toEqual("slug106");
});

test("should not show a hidden tag to a customer", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await query({
      slugOrId: "slug122",
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});

test("should show a hidden tag to an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;
  try {
    result = await query({
      slugOrId: "slug122",
      shopId: opaqueShopId,
      shouldIncludeInvisible: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tag.slug).toEqual("slug122");
});

test("should not show a hidden tag to an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    await query({
      slugOrId: "slug122",
      shopId: opaqueShopId,
      shouldIncludeInvisible: false
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});

import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const GroupsFullQuery = importAsString("./GroupsFullQuery.graphql");

jest.setTimeout(300000);

/**
 * @param {Object} mongoGroup The Group document in MongoDB schema
 * @returns {Object} The Group document in GraphQL schema
 */
function groupMongoSchemaToGraphQL(mongoGroup) {
  const doc = {
    ...mongoGroup,
    _id: encodeOpaqueId("reaction/group", mongoGroup._id),
    createdAt: mongoGroup.createdAt.toISOString(),
    createdBy: {
      _id: encodeOpaqueId("reaction/account", mongoGroup.createdBy)
    },
    updatedAt: mongoGroup.updatedAt.toISOString()
  };
  delete doc.shopId;
  return doc;
}

let testApp;
let groupsQuery;
let mockAdminAccount;
let mockOtherAccount;
let opaqueShopId;
let groups;
let allGroups;
let customerGroup;
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

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    name: "admin",
    permissions: ["reaction:legacy:groups/read"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  mockAdminAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  groups = Factory.Group.makeMany(3, { shopId });
  await testApp.collections.Groups.insertMany(groups);

  allGroups = await testApp.collections.Groups.find({}).toArray();

  mockOtherAccount = Factory.Account.makeOne({
    groups: [customerGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  await testApp.collections.Groups.updateMany({}, {
    $set: {
      createdBy: mockAdminAccount._id
    }
  });

  for (let index = 0; index < allGroups.length; index += 1) {
    allGroups[index].createdBy = mockAdminAccount._id;
  }

  groupsQuery = testApp.query(GroupsFullQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await groupsQuery({ shopId: opaqueShopId });
  } catch (error) {
    expect(error[0].message).toBe("Access Denied");
  }
});

test("authenticated with `reaction:legacy:groups/read` permissions, gets all groups", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const nodes = allGroups.map(groupMongoSchemaToGraphQL);

  // Default sortBy is createdAt ascending
  nodes.sort((item1, item2) => {
    if (item1.createdAt > item2.createdAt) return 1;
    if (item1.createdAt < item2.createdAt) return -1;
    return 0;
  });

  const result = await groupsQuery({ shopId: opaqueShopId });
  expect(result).toEqual({
    groups: {
      nodes
    }
  });

  await testApp.clearLoggedInUser();
});

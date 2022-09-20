import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const GroupFullQuery = importAsString("./GroupFullQuery.graphql");

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
let groupQuery;
let mockAdminAccount;
let mockOtherAccount;
let groups;
let globalSecondaryGroup;
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

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:groups/read"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  const globalAdminGroup = Factory.Group.makeOne({
    _id: "globalAdminGroup",
    createdBy: null,
    name: "globalAdmin",
    permissions: [
      "reaction:legacy:accounts/read",
      "reaction:legacy:groups/read"
    ],
    slug: "global-admin",
    shopId: null
  });
  await testApp.collections.Groups.insertOne(globalAdminGroup);

  globalSecondaryGroup = Factory.Group.makeOne({
    _id: "globalSecondaryGroup",
    createdBy: null,
    name: "globalSecondary",
    permissions: [
      "reaction:legacy:accounts/read"
    ],
    slug: "global-secondary"
  });
  await testApp.collections.Groups.insertOne(globalSecondaryGroup);

  mockAdminAccount = Factory.Account.makeOne({
    groups: [adminGroup._id, globalAdminGroup._id]
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  groups = Factory.Group.makeMany(2, { shopId });
  await testApp.collections.Groups.insertMany(groups);

  mockOtherAccount = Factory.Account.makeOne({
    groups: [groups[0]._id]
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  await testApp.collections.Groups.updateMany({}, {
    $set: {
      createdBy: mockOtherAccount._id
    }
  });

  for (let index = 0; index < groups.length; index += 1) {
    groups[index].createdBy = mockOtherAccount._id;
  }

  groupQuery = testApp.query(GroupFullQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await groupQuery({ id: groupMongoSchemaToGraphQL(groups[0])._id });
  } catch (error) {
    expect(error[0].message).toBe("Access Denied");
  }
});

test("authenticated with groups/read permission, gets any shop group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const expectedGroup = groupMongoSchemaToGraphQL(groups[0]);

  const result = await groupQuery({ id: expectedGroup._id });
  expect(result).toEqual({
    group: expectedGroup
  });

  await testApp.clearLoggedInUser();
});

test("authenticated with groups/read permission, gets any global group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const group = await testApp.collections.Groups.findOne({ _id: "globalSecondaryGroup" });

  const expectedGroup = groupMongoSchemaToGraphQL(group);

  const result = await groupQuery({ id: expectedGroup._id });

  expect(result).toEqual({
    group: expectedGroup
  });

  await testApp.clearLoggedInUser();
});

test("authenticated without groups/read permission, gets group they belong to", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  const expectedGroup = groupMongoSchemaToGraphQL(groups[0]);

  const result = await groupQuery({ id: expectedGroup._id });
  expect(result).toEqual({
    group: expectedGroup
  });

  await testApp.clearLoggedInUser();
});

test("authenticated without groups/read permission, does not get group they do not belong to", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  try {
    await groupQuery({ id: groupMongoSchemaToGraphQL(groups[1])._id });
  } catch (error) {
    expect(error[0].message).toBe("Access Denied");
  }

  await testApp.clearLoggedInUser();
});

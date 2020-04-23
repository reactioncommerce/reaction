import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddAccountToGroupMutation = importAsString("./CreateAccountGroupMutation.graphql");

jest.setTimeout(300000);

let createAccountGroup;
let customerGroup;
let mockAdminAccount;
let shopId;
let shopOpaqueId;
let testApp;

// Should match UTC datetime of the form YYYY-MM-DDTHH:MM:SS.mmmZ e.g. 2019-12-10T13:37:58.833Z
const UTC_REGEX_PATTERN = /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.]{1}[0-9]{3}Z\b/;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:groups/create"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  customerGroup = Factory.Group.makeOne({
    createdBy: null,
    name: "customer",
    permissions: [],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);

  createAccountGroup = testApp.mutate(AddAccountToGroupMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("anyone can add account to group if they have ALL the group permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const group = {
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    slug: "test-int-group"
  };

  const result = await createAccountGroup({ shopId: shopOpaqueId, group });

  expect(result.createAccountGroup.group).toMatchObject({
    _id: expect.any(String),
    createdBy: {
      _id: "cmVhY3Rpb24vYWNjb3VudDptb2NrQWRtaW5BY2NvdW50"
    },
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    shop: {
      _id: shopOpaqueId
    },
    slug: "test-int-group",
    updatedAt: expect.stringMatching(UTC_REGEX_PATTERN),
    createdAt: expect.stringMatching(UTC_REGEX_PATTERN)
  });
});


test("should throw if the group to be created has the same slug and shopId as an existing group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const group = {
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    slug: "test-int-group"
  };

  try {
    // Make sure DB is in clean state
    await testApp.collections.Groups.deleteMany({
      name: "test-int-group",
      slug: "test-int-group"
    });

    await createAccountGroup({ shopId: shopOpaqueId, group });

    // This should throw
    await createAccountGroup({ shopId: shopOpaqueId, group });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }

  const groups = await testApp.collections.Groups.find({
    name: "test-int-group",
    slug: "test-int-group"
  }).toArray();

  expect(groups.length).toBe(1);
});

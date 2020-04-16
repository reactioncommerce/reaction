import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const RemoveAccountFromGroupMutation = importAsString("./RemoveAccountFromGroupMutation.graphql");

jest.setTimeout(300000);

let accountOpaqueId;
let customerGroup;
let mockAdminAccount;
let mockAdminAccountWithMissingPermission;
let mockOtherAccount;
let removeAccountFromGroup;
let shopId;
let shopManagerGroup;
let shopManagerGroupWithoutGroupPermissions;
let shopManagerGroupOpaqueId;
let shopOpaqueId;
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
  shopId = await insertPrimaryShop(testApp.context);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: ["shop-manager-group"],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockAdminAccountWithMissingPermission = Factory.Account.makeOne({
    _id: "mockAdminAccountWithMissingPermission",
    groups: ["shop-manager-group-without-group-permissions"],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccountWithMissingPermission);

  mockOtherAccount = Factory.Account.makeOne({
    _id: "mockOtherAccount",
    groups: ["customer-group", "shop-manager-group"],
    shopId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  shopManagerGroup = Factory.Group.makeOne({
    _id: "shop-manager-group",
    createdBy: null,
    name: "shop manager",
    permissions: ["reaction:legacy:groups/manage:accounts", "reaction:legacy:accounts/update"],
    slug: "shop manager",
    shopId
  });
  await testApp.collections.Groups.insertOne(shopManagerGroup);

  shopManagerGroupWithoutGroupPermissions = Factory.Group.makeOne({
    _id: "shop-manager-group-without-group-permissions",
    createdBy: null,
    name: "shop manager without group permissions",
    permissions: ["someOtherPermissions"],
    slug: "shop manager without group permissions",
    shopId
  });
  await testApp.collections.Groups.insertOne(shopManagerGroupWithoutGroupPermissions);

  customerGroup = Factory.Group.makeOne({
    _id: "customer-group",
    createdBy: null,
    name: "customer",
    permissions: ["customerGroupPermission"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  accountOpaqueId = encodeOpaqueId("reaction/account", mockOtherAccount._id);
  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
  shopManagerGroupOpaqueId = encodeOpaqueId("reaction/group", shopManagerGroup._id);

  removeAccountFromGroup = testApp.mutate(RemoveAccountFromGroupMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

beforeEach(async () => {
  await testApp.collections.Accounts.updateOne({ _id: mockOtherAccount._id }, {
    $set: {
      groups: ["customer-group", "shop-manager-group"]
    }
  });
});

test("can remove account from group if they have `reaction:legacy:groups/manage:accounts` permission", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await removeAccountFromGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });

  expect(result.removeAccountFromGroup.group).toEqual({
    _id: shopManagerGroupOpaqueId,
    createdAt: shopManagerGroup.createdAt.toISOString(),
    createdBy: null,
    description: shopManagerGroup.description,
    name: shopManagerGroup.name,
    permissions: shopManagerGroup.permissions,
    shop: {
      _id: shopOpaqueId
    },
    slug: shopManagerGroup.slug,
    updatedAt: shopManagerGroup.updatedAt.toISOString()
  });

  const account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups).toEqual([customerGroup._id]);
});

import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: ["shop-manager-group"],
    roles: {
      [shopId]: ["reaction:legacy:groups/manage:accounts"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockAdminAccountWithMissingPermission = Factory.Account.makeOne({
    _id: "mockAdminAccountWithMissingPermission",
    groups: ["shop-manager-group-without-group-permissions"],
    roles: {
      [shopId]: ["someOtherPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccountWithMissingPermission);

  mockOtherAccount = Factory.Account.makeOne({
    _id: "mockOtherAccount",
    groups: ["customer-group", "shop-manager-group"],
    roles: {},
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
  shopManagerGroupWithoutGroupPermissionsOpaqueId = encodeOpaqueId("reaction/group", shopManagerGroupWithoutGroupPermissions._id);

  removeAccountFromGroup = testApp.mutate(RemoveAccountFromGroupMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.stop();
});

beforeEach(async () => {
  await testApp.collections.Accounts.updateOne({ _id: mockOtherAccount._id }, {
    $set: {
      groups: ["customer-group", "shop-manager-group"]
    }
  });

  await testApp.collections.users.updateOne({ _id: mockOtherAccount._id }, {
    $set: {
      roles: {
        [shopId]: ["customerGroupPermission", "reaction:legacy:groups/manage:accounts", "reaction:legacy:shops/owner"]
      }
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

  const user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(customerGroup.permissions);
});

test("cannot remove account from group if they do not have `reaction:legacy:groups/manage:accounts` permission", async () => {
  await testApp.setLoggedInUser(mockAdminAccountWithMissingPermission);

  const beforeAccount = await testApp.collections.Accounts.findOne({ userId: mockOtherAccount._id });
  expect(beforeAccount.groups).toEqual(["customer-group", "shop-manager-group"]);


  const beforeUser = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(beforeUser.roles[shopId]).toEqual(["customerGroupPermission", "reaction:legacy:groups/manage:accounts", "reaction:legacy:shops/owner"]);

  try {
    await removeAccountFromGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }

  const account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups.length).toBe(2);
  expect(account.groups).toEqual(["customer-group", "shop-manager-group"]);

  const user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(["customerGroupPermission", "reaction:legacy:groups/manage:accounts", "reaction:legacy:shops/owner"]);
});

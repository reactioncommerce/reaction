import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AddAccountToGroupMutation = importAsString("./CreateAccountGroupMutation.graphql");

jest.setTimeout(300000);

let accountOpaqueId;
let createAccountGroup;
let customerGroup;
let customerGroupOpaqueId;
let mockAdminAccount;
let mockAdminAccountWithMissingPermission;
let mockOtherAccount;
let shopId;
let shopManagerGroup;
let shopManagerGroupOpaqueId;
let shopOpaqueId;
let testApp;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    roles: {
      [shopId]: ["admin", "shopManagerGroupPermission", "someOtherPermission", "customerGroupPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  mockAdminAccountWithMissingPermission = Factory.Account.makeOne({
    _id: "mockAdminAccountWithMissingPermission",
    roles: {
      [shopId]: ["admin", "someOtherPermission"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccountWithMissingPermission);

  mockOtherAccount = Factory.Account.makeOne({
    _id: "mockOtherAccount",
    groups: [],
    roles: {},
    shopId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  shopManagerGroup = Factory.Group.makeOne({
    createdBy: null,
    name: "shop manager",
    permissions: ["admin", "shopManagerGroupPermission"],
    slug: "shop manager",
    shopId
  });
  await testApp.collections.Groups.insertOne(shopManagerGroup);

  customerGroup = Factory.Group.makeOne({
    createdBy: null,
    name: "customer",
    permissions: ["customerGroupPermission"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  accountOpaqueId = encodeOpaqueId("reaction/account", mockOtherAccount._id);
  customerGroupOpaqueId = encodeOpaqueId("reaction/group", customerGroup._id);
  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
  shopManagerGroupOpaqueId = encodeOpaqueId("reaction/group", shopManagerGroup._id);

  createAccountGroup = testApp.mutate(AddAccountToGroupMutation);
});

afterAll(async () => {
  await testApp.stop();
});

beforeEach(async () => {
  await testApp.collections.Accounts.updateOne({ _id: mockOtherAccount._id }, {
    $set: {
      groups: []
    }
  });

  await testApp.collections.users.updateOne({ _id: mockOtherAccount._id }, {
    $set: {
      roles: {}
    }
  });
});

test("anyone can add account to group if they have ALL the group permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  /**
   "A free text description of this group"
   description: String

   "A unique name for the group"
   name: String!

   "A list of the account permissions implied by membership in this group"
   permissions: [String]

   "A unique URL-safe string representing this group"
   slug: String!
   */

  const group = {
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    slug: "test-int-group"

  };
  const result = await createAccountGroup({ shopId: shopOpaqueId, group });

  expect(result.createAccountGroup.group).toEqual({
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
  expect(account.groups).toEqual([shopManagerGroup._id]);

  const user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(shopManagerGroup.permissions);
});

/**
test("anyone cannot add account to group if they do not have ALL the group permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccountWithMissingPermission);

  const beforeUser = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(beforeUser.roles[shopId]).toBe(undefined);

  try {
    await createAccountGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }

  const account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups.length).toBe(0);

  const user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toBe(undefined);
});

test("permissions from the account's previous group are removed", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  await createAccountGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });

  let account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups).toEqual([shopManagerGroup._id]);

  let user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(shopManagerGroup.permissions);

  await createAccountGroup({ accountId: accountOpaqueId, groupId: customerGroupOpaqueId });

  account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups).toEqual([customerGroup._id]);

  user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(customerGroup.permissions);
});
 */

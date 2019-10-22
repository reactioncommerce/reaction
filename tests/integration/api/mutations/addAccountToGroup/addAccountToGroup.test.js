import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import AddAccountToGroupMutation from "./AddAccountToGroupMutation.graphql";

jest.setTimeout(300000);

let accountOpaqueId;
let addAccountToGroup;
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

  accountOpaqueId = encodeAccountOpaqueId(mockOtherAccount._id);
  customerGroupOpaqueId = encodeGroupOpaqueId(customerGroup._id);
  shopOpaqueId = encodeShopOpaqueId(shopId);
  shopManagerGroupOpaqueId = encodeGroupOpaqueId(shopManagerGroup._id);

  addAccountToGroup = testApp.mutate(AddAccountToGroupMutation);
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

  const result = await addAccountToGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });

  expect(result.addAccountToGroup.group).toEqual({
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

test("anyone cannot add account to group if they do not have ALL the group permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccountWithMissingPermission);

  const beforeUser = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(beforeUser.roles[shopId]).toBe(undefined);

  try {
    await addAccountToGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });
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

  await addAccountToGroup({ accountId: accountOpaqueId, groupId: shopManagerGroupOpaqueId });

  let account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups).toEqual([shopManagerGroup._id]);

  let user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(shopManagerGroup.permissions);

  await addAccountToGroup({ accountId: accountOpaqueId, groupId: customerGroupOpaqueId });

  account = await testApp.collections.Accounts.findOne({ _id: mockOtherAccount._id });
  expect(account.groups).toEqual([customerGroup._id]);

  user = await testApp.collections.users.findOne({ _id: mockOtherAccount._id });
  expect(user.roles[shopId]).toEqual(customerGroup.permissions);
});

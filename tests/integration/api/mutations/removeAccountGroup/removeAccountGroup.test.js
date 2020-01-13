import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AddAccountToGroupMutation = importAsString("./AddAccountToGroupMutation.graphql");
const RemoveAccountGroupMutation = importAsString("./RemoveAccountGroupMutation.graphql");

jest.setTimeout(300000);

let addAccountToGroup;
let removeAccountGroup;
let customerGroup;
let mockAdminAccount;
let mockAdminAccountWithBadPermissions;
let mockCustomerAccount;
let shopId;
let shopOpaqueId;
let testApp;
let testGroup;

let guestGroup;
let ownerGroup;
let shopManagerGroup;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  shopId = await testApp.insertPrimaryShop();
  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);

  addAccountToGroup = testApp.mutate(AddAccountToGroupMutation);
  removeAccountGroup = testApp.mutate(RemoveAccountGroupMutation);

  // Create users
  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    roles: {
      [shopId]: ["owner", "admin", "ownerGroupPermission", "testGroupGroupPermission", "customerGroupPermission"]
    },
    shopId
  });

  mockAdminAccountWithBadPermissions = Factory.Account.makeOne({
    _id: "mockAdminAccountWithBadPermissions",
    roles: {
      [shopId]: ["admin"]
    },
    shopId
  });

  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccount",
    groups: [],
    shopId
  });

  // Create group data mocks
  customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });

  guestGroup = Factory.Group.makeOne({
    _id: "guestGroup",
    createdBy: null,
    name: "guest",
    permissions: ["guest"],
    slug: "guest",
    shopId
  });

  ownerGroup = Factory.Group.makeOne({
    _id: "ownerGroup",
    createdBy: null,
    name: "owner",
    permissions: ["owner"],
    slug: "owner",
    shopId
  });

  shopManagerGroup = Factory.Group.makeOne({
    _id: "shopManagerGroup",
    createdBy: null,
    name: "shop-manager",
    permissions: ["admin"],
    slug: "shop-manager",
    shopId
  });

  testGroup = Factory.Group.makeOne({
    _id: "testGroup",
    createdBy: null,
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    slug: "test-int-group",
    shopId
  });
});

afterAll(async () => {
  await testApp.collections.Groups.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

beforeEach(async () => {
  // Create users
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockAdminAccountWithBadPermissions);
  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  // Create groups
  await testApp.collections.Groups.insertOne(customerGroup);
  await testApp.collections.Groups.insertOne(testGroup);
  await testApp.collections.Groups.insertOne(ownerGroup);
  await testApp.collections.Groups.insertOne(guestGroup);
  await testApp.collections.Groups.insertOne(shopManagerGroup);

  // Add customer account to the testGroup
  await addAccountToGroup({
    accountId: encodeOpaqueId("reaction/account", "mockCustomerAccount"),
    groupId: encodeOpaqueId("reaction/group", "testGroup")
  });

  await testApp.clearLoggedInUser();
});

afterEach(async () => {
  await testApp.collections.Groups.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
});

test("a customer account should not be able to remove a group", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  // Expect the customer to have all of the roles from the testGroup
  const beforeCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(beforeCustomer.roles[shopId]).toEqual(["test-perm-1", "test-perm-2"]);

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "testGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
    return;
  }
});

test("an admin account should be able to remove a group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  // Expect the Account to be moved to the customer group
  const beforeAccount = await testApp.context.collections.Accounts.findOne({ _id: "mockCustomerAccount" });
  expect(beforeAccount.groups).toEqual(["testGroup"]);

  // Expect the customer to have all of the roles from the testGroup
  const beforeCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(beforeCustomer.roles[shopId]).toEqual(["test-perm-1", "test-perm-2"]);

  let result;

  try {
    result = await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "testGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.removeAccountGroup.group._id).toEqual(encodeOpaqueId("reaction/group", "testGroup"));

  // Ensure the group was deleted
  const deletedGroup = await testApp.context.collections.Groups.findOne({ _id: testGroup });
  expect(deletedGroup).toBeNull();

  // Expect the Account to be moved to the customer group
  const afterAccount = await testApp.context.collections.Accounts.findOne({ _id: "mockCustomerAccount" });
  expect(afterAccount.groups).toEqual(["customerGroup"]);

  // Expect the user removed to have the permissions of a customer
  const afterCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(afterCustomer.roles[shopId]).toEqual(["customer"]);
});

test("an admin account cannot default groups, owner, shop-manager, guest and customer", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "shopManagerGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "ownerGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "guestGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "customerGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }
});

test("an admin account cannot remove a group unless there is a default customer group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  // Remove the default customer group directly with mongo.
  // This simulates a user manually deleting or somehow otherwise altering the default customer group in the database
  await testApp.collections.Groups.deleteOne({ _id: "customerGroup" });

  // Expect the Account to be moved to the customer group
  const beforeAccount = await testApp.context.collections.Accounts.findOne({ _id: "mockCustomerAccount" });
  expect(beforeAccount.groups).toEqual(["testGroup"]);

  // Expect the customer to have all of the roles from the testGroup
  const beforeCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(beforeCustomer.roles[shopId]).toEqual(["test-perm-1", "test-perm-2"]);

  try {
    await removeAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "testGroup"),
        shopId: shopOpaqueId
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
    return;
  }
});

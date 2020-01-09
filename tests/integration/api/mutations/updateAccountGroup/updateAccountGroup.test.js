import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AddAccountToGroupMutation = importAsString("./AddAccountToGroupMutation.graphql");
const UpdateAccountGroupMutation = importAsString("./UpdateAccountGroupMutation.graphql");

jest.setTimeout(300000);

let addAccountToGroup;
let updateAccountGroup;
let customerGroup;
let mockAdminAccount;
let mockAdminAccountWithBadPermissions;
let mockCustomerAccount;
let shopId;
let shopOpaqueId;
let testApp;
let testGroup;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  shopId = await testApp.insertPrimaryShop();
  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);

  addAccountToGroup = testApp.mutate(AddAccountToGroupMutation);
  updateAccountGroup = testApp.mutate(UpdateAccountGroupMutation);

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
    shopId
  });

  await testApp.context.collections.Accounts.updateOne(
    { _id: "mockAdminAccount" },
    {
      $set: {
        groups: ["testGroup"]
      }
    }
  );


  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockAdminAccountWithBadPermissions);
  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  // Create groups
  customerGroup = Factory.Group.makeOne({
    createdBy: null,
    name: "customer",
    permissions: [],
    slug: "customer",
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

  await testApp.collections.Groups.insertOne(customerGroup);
  await testApp.collections.Groups.insertOne(testGroup);

  // Add customer account to the test group
  await addAccountToGroup({
    accountId: encodeOpaqueId("reaction/account", "mockCustomerAccount"),
    groupId: encodeOpaqueId("reaction/group", "testGroup")
  });

  await testApp.clearLoggedInUser();
});


afterAll(async () => {
  await testApp.collections.Groups.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("a customer account should not be able to update groups", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  // Expect the before customer to have been added to the test group and have all the roles of that group
  const beforeCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(beforeCustomer.roles[shopId]).toEqual(["test-perm-1", "test-perm-2"]);

  try {
    await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "testGroup"),
        shopId: shopOpaqueId,
        group: {
          permissions: ["test-perm-4"]
        }
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
    return;
  }
});

test("anyone can add account to group if they have ALL the group permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  // Expect the before customer to have been added to the test group and have all the roles of that group
  const beforeCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(beforeCustomer.roles[shopId]).toEqual(["test-perm-1", "test-perm-2"]);

  let result;

  try {
    result = await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "testGroup"),
        shopId: shopOpaqueId,
        group: {
          permissions: ["test-perm-4"]
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateAccountGroup.group.permissions).toEqual(["test-perm-4"]);

  const afterCustomer = await testApp.context.collections.users.findOne({ _id: "mockCustomerAccount" });
  expect(afterCustomer.roles[shopId]).toEqual(["test-perm-4"]);
});


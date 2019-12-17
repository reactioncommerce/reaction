import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AddUserPermissionsMutation = importAsString("./addUserPermissionsMutation.graphql");

jest.setTimeout(300000);

let addUserPermissions;
let customerGroup;
let mockAdminAccount;
let mockAdminAccountIdOpaque;
let mockOtherAccount;
let mockOtherAccountIdOpaque;
let shopId;
let shopManagerGroup;
let shopOpaqueId;
let testApp;

const mockAdminAccountId = "mockAdminAccount";
const mockOtherAccountId = "mockOtherAccount";
const clientMutationId = "SOME_CLIENT_MUTATION_ID";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    _id: mockAdminAccountId,
    roles: {
      [shopId]: ["admin", "reaction-accounts"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);


  mockOtherAccount = Factory.Account.makeOne({
    _id: mockOtherAccountId,
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

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
  mockAdminAccountIdOpaque = encodeOpaqueId("reaction/account", mockAdminAccountId);
  mockOtherAccountIdOpaque = encodeOpaqueId("reaction/account", mockOtherAccountId);

  addUserPermissions = testApp.mutate(AddUserPermissionsMutation);
});

afterAll(async () => {
  testApp.collections.Accounts.deleteMany({});
  testApp.collections.Shops.deleteMany({});
  testApp.collections.users.deleteMany({});
  testApp.collections.Groups.deleteMany({});
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

test("addUserPermissions anyone can with the required permissions can add group to an account", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const groupName = "test-group-1";
  // The group that is to be added tp th  account
  const testGroup1 = Factory.Group.makeOne({
    createdBy: null,
    name: groupName,
    permissions: ["test-group-1-permission"],
    slug: groupName,
    shopId
  });
  await testApp.collections.Groups.insertOne(testGroup1);

  const result = await addUserPermissions({ groups: ["test-group-1"], shopId: shopOpaqueId, accountId: mockOtherAccountIdOpaque, clientMutationId });
  const dbResult = await testApp.collections.Accounts.findOne({ _id: mockOtherAccountId });
  expect(result.addUserPermissions.clientMutationId).toEqual(clientMutationId);
  expect(dbResult.groups).toEqual(expect.arrayContaining(["test-group-1"]));
});


test("addUserPermissions anyone without the required permissions should be denied access to add group to an account", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  const groupName = "test-group-1";
  // The group that is to be added tp th  account
  const testGroup1 = Factory.Group.makeOne({
    createdBy: null,
    name: groupName,
    permissions: ["test-group-1-permission"],
    slug: groupName,
    shopId
  });
  await testApp.collections.Groups.insertOne(testGroup1);
  let err = null;
  try {
    await addUserPermissions({ groups: ["test-group-1"], shopId: shopOpaqueId, accountId: mockAdminAccountIdOpaque, clientMutationId });
  } catch (errors) {
    err = errors;
  }
  expect(err).toBeTruthy();
  expect(err[0]).toMatchSnapshot();
});

test("addUserPermissions should throw if there is an empty list of groups provided in the input", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let err = null;
  try {
    await addUserPermissions({ groups: [], shopId: shopOpaqueId, accountId: mockOtherAccountIdOpaque, clientMutationId });
  } catch (errors) {
    err = errors;
  }
  expect(err).toBeTruthy();
  expect(err[0]).toMatchSnapshot();
});

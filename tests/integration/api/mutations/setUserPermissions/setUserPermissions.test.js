import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const SetUserPermissionsMutation = importAsString("./setUserPermissionsMutation.graphql");

jest.setTimeout(300000);

let setUserPermissions;
let customerGroup;
let mockAdminAccount;
let mockOtherAccount;
let shopId;
let shopManagerGroup;
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

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);

  setUserPermissions = testApp.mutate(SetUserPermissionsMutation);
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

test("anyone can with the required permissions can add group to an account", async () => {
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

  await setUserPermissions({ groups: ["test-group-1"], shopId: shopOpaqueId });
  const dbResult = await testApp.collections.Accounts.findOne({ _id: mockAdminAccount._id });
  expect(dbResult.groups).toEqual(expect.arrayContaining(["test-group-1"]));
});


test("anyone without the required permissions should be denied access to add group to an account", async () => {
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
    await setUserPermissions({ groups: ["test-group-1"], shopId: shopOpaqueId });
  } catch (errors) {
    err = errors;
  }
  expect(err).toBeTruthy();
  expect(err[0]).toMatchSnapshot();
});



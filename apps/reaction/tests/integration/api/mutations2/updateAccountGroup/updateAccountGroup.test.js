import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const UpdateAccountGroupMutation = importAsString("./UpdateAccountGroupMutation.graphql");

jest.setTimeout(300000);

let adminGroup;
let adminSecondaryGroup;
let customerGroup;
let guestGroup;
let mockAdminAccount;
let mockAdminAccountWithBadPermissions;
let mockCustomerAccount;
let ownerGroup;
let shopId;
let shopManagerGroup;
let shopOpaqueId;
let testApp;
let testGroup;
let updateAccountGroup;

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
  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);

  updateAccountGroup = testApp.mutate(UpdateAccountGroupMutation);

  shopManagerGroup = Factory.Group.makeOne({
    _id: "shopManagerGroup",
    createdBy: null,
    name: "shopManager",
    permissions: ["manager"],
    slug: "shop manager",
    shopId
  });

  ownerGroup = Factory.Group.makeOne({
    _id: "ownerGroup",
    createdBy: null,
    name: "ownerGroup",
    permissions: ["owner"],
    slug: "owner",
    shopId
  });

  adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:groups/update", "reaction:legacy:groups/manage:accounts"],
    slug: "admin",
    shopId
  });

  adminSecondaryGroup = Factory.Group.makeOne({
    _id: "adminSecondaryGroup",
    createdBy: null,
    name: "adminSecondaryGroup",
    permissions: ["incorrectPermissions"],
    slug: "adminSecondaryGroup",
    shopId
  });

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

  testGroup = Factory.Group.makeOne({
    _id: "testGroup",
    createdBy: null,
    description: "a group for testing purposes",
    name: "test-int-group",
    permissions: ["test-perm-1", "test-perm-2"],
    slug: "test-int-group",
    shopId
  });

  // Create accounts
  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: [adminGroup._id],
    shopId
  });

  mockAdminAccountWithBadPermissions = Factory.Account.makeOne({
    _id: "mockAdminAccountWithBadPermissions",
    groups: [adminSecondaryGroup._id],
    shopId
  });

  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccount",
    groups: ["testGroup"],
    shopId
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

beforeEach(async () => {
  // Create accounts
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockAdminAccountWithBadPermissions);
  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  // Create groups
  await testApp.collections.Groups.insertOne(ownerGroup);
  await testApp.collections.Groups.insertOne(shopManagerGroup);
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(adminSecondaryGroup);
  await testApp.collections.Groups.insertOne(customerGroup);
  await testApp.collections.Groups.insertOne(guestGroup);
  await testApp.collections.Groups.insertOne(testGroup);

  // Add customer account to the testGroup
  // await addAccountToGroup({
  //   accountId: encodeOpaqueId("reaction/account", "mockCustomerAccount"),
  //   groupId: encodeOpaqueId("reaction/group", "testGroup")
  // });

  await testApp.clearLoggedInUser();
});

afterEach(async () => {
  await testApp.collections.Groups.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
});

// test("a customer account should not be able to update groups", async () => {
//   await testApp.setLoggedInUser(mockCustomerAccount);

//   try {
//     await updateAccountGroup({
//       input: {
//         groupId: encodeOpaqueId("reaction/group", "testGroup"),
//         shopId: shopOpaqueId,
//         group: {
//           permissions: ["test-perm-4"]
//         }
//       }
//     });
//   } catch (errors) {
//     expect(errors).toMatchSnapshot();
//     return;
//   }
// });

// test("an admin account should be able to update groups", async () => {
//   await testApp.setLoggedInUser(mockAdminAccount);

//   let result;

//   try {
//     result = await updateAccountGroup({
//       input: {
//         groupId: encodeOpaqueId("reaction/group", "testGroup"),
//         shopId: shopOpaqueId,
//         group: {
//           permissions: ["test-perm-4"]
//         }
//       }
//     });
//   } catch (error) {
//     expect(error).toBeUndefined();
//     return;
//   }

//   expect(result.updateAccountGroup.group.permissions).toEqual(["test-perm-4", "customer"]);
// });

test("an admin account should not be able to change the slug of a default group if is doesn't match", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "shopManagerGroup"),
        shopId: shopOpaqueId,
        group: {
          slug: "new-slug"
        }
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "ownerGroup"),
        shopId: shopOpaqueId,
        group: {
          slug: "new-slug"
        }
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "guestGroup"),
        shopId: shopOpaqueId,
        group: {
          slug: "new-slug"
        }
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }

  try {
    await updateAccountGroup({
      input: {
        groupId: encodeOpaqueId("reaction/group", "customerGroup"),
        shopId: shopOpaqueId,
        group: {
          slug: "new-slug"
        }
      }
    });
  } catch (errors) {
    expect(errors).toMatchSnapshot();
  }
});

// test("an admin account should not be able to change the slug of a default group unless it matches", async () => {
//   await testApp.setLoggedInUser(mockAdminAccount);

//   let result;

//   try {
//     result = await updateAccountGroup({
//       input: {
//         groupId: encodeOpaqueId("reaction/group", "customerGroup"),
//         shopId: shopOpaqueId,
//         group: {
//           name: "Customer PlusPlus",
//           slug: "customer"
//         }
//       }
//     });
//   } catch (errors) {
//     expect(errors).toMatchSnapshot();
//   }

//   expect(result.updateAccountGroup.group.name).toEqual("Customer PlusPlus");
//   expect(result.updateAccountGroup.group.slug).toEqual("customer");
// });

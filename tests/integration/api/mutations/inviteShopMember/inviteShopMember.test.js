import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const inviteShopMember = importAsString("./inviteShopMember.graphql");

jest.setTimeout(300000);

const shopId = "123";
const mockInvitedUserId = "1";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:groups/manage:accounts", "reaction:legacy:accounts/invite:group"],
  slug: "admin",
  shopId
});

const customerGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["customer"],
  slug: "customer",
  shopId
});

const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const opaqueGroupId = encodeOpaqueId("reaction/group", adminGroup._id);
const shopName = "Test Shop";
const mockEmail = "user@example.com";

let testApp;
let inviteShopMemberMutation;

const mockAdminAccount = Factory.Account.makeOne({
  _id: "mockAdminAccountId",
  groups: [adminGroup._id],
  shopId
});

const mockInvitedUser = Factory.Account.makeOne({
  _id: mockInvitedUserId,
  groups: [customerGroup._id],
  emails: [{ address: mockEmail }],
  shopId
});

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  // await testApp.collections.Groups.insertOne(ownerGroup);
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.context.mutations.createShop(testApp.context.getInternalContext(), {
    name: shopName,
    shopId
  });

  // Set shop email address
  await testApp.collections.Shops.updateOne(
    { _id: shopId },
    { $set: { emails: [{ address: "testing@reactioncommerce.com" }] } }
  );

  await testApp.createUserAndAccount(mockInvitedUser);
  inviteShopMemberMutation = testApp.mutate(inviteShopMember);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot invite new shop members", async () => {
  try {
    await inviteShopMemberMutation({
      input: {
        email: mockEmail,
        groupId: opaqueGroupId,
        name: "test user",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

// eslint-disable-next-line max-len
test("a user with `reaction:legacy:groups/manage:accounts` and `reaction:legacy:accounts/invite:group` permissions can invite a new shop admin member with an existing account", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await inviteShopMemberMutation({
      input: {
        email: mockEmail,
        groupId: opaqueGroupId,
        name: "test user",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.inviteShopMember.account.emailRecords[0].address).toEqual(mockEmail);
});

// eslint-disable-next-line max-len
test("a `reaction:legacy:groups/manage:accounts` and `reaction:legacy:accounts/invite:group` permissions can invite a new shop admin user with no existing account", async () => {
  // Ensure user to invite does not have an account
  await testApp.collections.users.deleteOne({ _id: mockInvitedUserId });
  await testApp.collections.Accounts.deleteOne({ _id: mockInvitedUserId });
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    await inviteShopMemberMutation({
      input: {
        email: mockEmail,
        groupId: opaqueGroupId,
        name: "test user",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  // Expect a new record to be added to the AccountInvites collection
  const invitedUserDoc = await testApp.collections.AccountInvites.findOne({
    email: mockEmail
  });

  expect(invitedUserDoc.email).toEqual(mockEmail);
});

import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const inviteShopMember = importAsString("./inviteShopMember.graphql");

jest.setTimeout(300000);

const mockInvitedUserId = "1";
const mockEmail = "user@example.com";

let testApp;
let inviteShopMemberMutation;
let opaqueShopId;
let mockAdminAccount;

const shopManagerGroup = Factory.Group.makeOne({ _id: "456", name: "mockGroup" });
const opaqueGroupId = encodeOpaqueId("reaction/group", shopManagerGroup._id);

const mockInvitedUser = Factory.Account.makeOne({
  _id: mockInvitedUserId,
  emails: [{ address: mockEmail }]
});

beforeAll(async () => {
  testApp = new TestApp();

  inviteShopMemberMutation = testApp.mutate(inviteShopMember);

  await testApp.start();

  const internalShopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccountId",
    groups: [shopManagerGroup._id],
    roles: {
      [internalShopId]: [
        "reaction:legacy:accounts/invite:group",
        "reaction:legacy:groups/manage:accounts"
      ]
    }
  });

  await testApp.createUserAndAccount(mockAdminAccount);

  // Emit so that email templates for invites are created
  await testApp.context.appEvents.emit("afterShopCreate", {
    createdBy: "mockAdminAccountId",
    shop: await testApp.collections.Shops.findOne({ _id: internalShopId })
  });

  opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId);

  // Set shop email address
  await testApp.collections.Shops.updateOne(
    { _id: internalShopId },
    { $set: { emails: [{ address: "testing@reactioncommerce.com" }] } }
  );

  await testApp.createUserAndAccount(mockInvitedUser);

  shopManagerGroup.shopId = internalShopId;
  await testApp.collections.Groups.insertOne(shopManagerGroup);
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

test("a shop owner can invite a new shop admin member with an existing account", async () => {
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

test("a shop owner can invite a new shop admin user with no existing account", async () => {
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

  const lowercaseEmail = mockEmail.toLowerCase();

  // Expect a new record to be added to the AccountInvites collection
  const invitedUserDoc = await testApp.collections.AccountInvites.findOne({
    email: lowercaseEmail
  });

  expect(invitedUserDoc.email).toEqual(lowercaseEmail);
});

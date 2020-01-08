import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const inviteShopMember = importAsString("./inviteShopMember.graphql");

jest.setTimeout(300000);

const shopId = "123";
const mockInvitedUserId = "1";
const mockGroup = { _id: "456", name: "mockGroup", shopId };
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const opaqueGroupId = encodeOpaqueId("reaction/group", mockGroup._id);
const shopName = "Test Shop";
const mockEmail = "user@example.com";

let testApp;
let inviteShopMemberMutation;

const mockAdminAccount = Factory.Account.makeOne({
  _id: "mockAdminAccountId",
  roles: {
    [shopId]: ["owner"]
  },
  groups: [mockGroup._id],
  shopId
});

const mockInvitedUser = Factory.Account.makeOne({
  _id: mockInvitedUserId,
  roles: {
    [shopId]: ["admin"]
  },
  emails: [{ address: mockEmail }],
  shopId
});

const shopManagerGroup = Factory.Group.makeOne({
  ...mockGroup
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.context.mutations.createShop(context.getInternalContext(), {
    name: shopName,
    shopId
  });

  // Set shop email address
  await testApp.collections.Shops.updateOne(
    { _id: shopId },
    { $set: { emails: [{ address: "testing@reactioncommerce.com" }] } }
  );

  await testApp.createUserAndAccount(mockInvitedUser);
  await testApp.collections.Groups.insertOne(shopManagerGroup);
  inviteShopMemberMutation = testApp.mutate(inviteShopMember);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

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

  // Expect a new record to be added to the AccountInvites collection
  const invitedUserDoc = await testApp.collections.AccountInvites.findOne({
    email: mockEmail
  });

  expect(invitedUserDoc.email).toEqual(mockEmail);
});

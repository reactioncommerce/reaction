import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const inviteShopMember = importAsString("./inviteShopMember.graphql");

jest.setTimeout(300000);

const shopId = "123";
const mockGroup = { _id: "456", name: "mockGroup", shopId };
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const opaqueGroupId = encodeOpaqueId("reaction/group", mockGroup._id);
const shopName = "Test Shop";

let testApp;
let inviteShopMemberMutation;

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [shopId]: ["owner"]
  },
  groups: [mockGroup._id],
  shopId
});

const mockInvitedUser = Factory.Account.makeOne({
  roles: {
    [shopId]: ["admin"]
  },
  emails: [{ address: "test@example.com" }],
  shopId
});

const shopManagerGroup = Factory.Group.makeOne({
  ...mockGroup
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: shopId, name: shopName });

  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockInvitedUser);
  await testApp.collections.Groups.insertOne(shopManagerGroup);
  inviteShopMemberMutation = testApp.mutate(inviteShopMember);
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
        email: "test@example.com",
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
        email: "test@example.com",
        groupId: opaqueGroupId,
        name: "test user",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.inviteShopMember.account.emailRecords[0].address).toEqual("test@example.com");
});

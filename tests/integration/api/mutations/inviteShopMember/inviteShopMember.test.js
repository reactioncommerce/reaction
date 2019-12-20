import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const inviteShopMember = importAsString("./inviteShopMember.graphql");

jest.setTimeout(300000);

const shopId = "123";
const groupId = "333";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const opaqueGroupId = encodeOpaqueId("reaction/group", groupId);
const shopName = "Test Shop";

let testApp;
let inviteShopMemberMutation;

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [shopId]: ["reaction-accounts", "account/invite", "admin"]
  },
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
  _id: groupId,
  createdBy: null,
  name: "shop manager",
  permissions: ["admin", "shopManagerGroupPermission"],
  slug: "shop manager",
  shopId
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

test("invite a new shop admin member", async () => {
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

  console.log(JSON.stringify(result));
});

import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import RemoveTagMutation from "./RemoveTagMutation.graphql";
import Logger from "@reactioncommerce/logger";

let testApp;
let shopId;
let removeTag;
let mockTagsAccount;
let tagInput;
let fakeTag;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockTagsAccount = Factory.Accounts.makeOne({
    roles: {
      [encodeShopOpaqueId(shopId)]: ["owner"]
    }
  });
  await testApp.createUserAndAccount(mockTagsAccount);

  removeTag = testApp.mutate(RemoveTagMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});
beforeEach(async () => {
  fakeTag = Factory.Tag.makeOne({
    _id: encodeTagOpaqueId(123),
    shopId: encodeShopOpaqueId(shopId)
  });

  await testApp.collections.Tags.insertOne(fakeTag);

  tagInput = {
    id: encodeTagOpaqueId(fakeTag._id),
    shopId: encodeShopOpaqueId(fakeTag.shopId)
  };
});
afterEach(async () => {
  await testApp.collections.Tags.deleteMany({});
});

const accountInternalId = "123";

describe("unauthorized user", () => {
  let logLevel;
  beforeAll(async () => {
    await testApp.setLoggedInUser({ _id: accountInternalId });
    logLevel = Logger.level();
    Logger.level("FATAL");
  });
  afterAll(async () => {
    await testApp.clearLoggedInUser();
    Logger.level(logLevel);
  });
  test("cannot remove tag", async () => {
    expect.assertions(1);
    try {
      await removeTag(tagInput);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
describe("authorized user", () => {
  beforeAll(async () => {
    await testApp.setLoggedInUser(mockTagsAccount);
  });
  afterAll(async () => {
    await testApp.clearLoggedInUser();
  });
  test("can remove tag", async () => {
    try {
      let removedTag = await testApp.collections.Tags.findOne({ _id: fakeTag._id, shopId: fakeTag.shopId });
      expect(removedTag).not.toBeNull();
      await removeTag(tagInput);
      removedTag = await testApp.collections.Tags.findOne({ _id: fakeTag._id, shopId: fakeTag.shopId });
      expect(removedTag).toBeNull();
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
});

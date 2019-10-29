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

const accountInternalId = "123";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockTagsAccount = Factory.Account.makeOne({
    roles: {
      [encodeShopOpaqueId(shopId)]: ["owner"]
    }
  });
  await testApp.createUserAndAccount(mockTagsAccount);

  removeTag = testApp.mutate(RemoveTagMutation);

  fakeTag = Factory.Tag.makeOne({
    _id: encodeTagOpaqueId(accountInternalId),
    shopId: encodeShopOpaqueId(shopId)
  });

  tagInput = {
    id: encodeTagOpaqueId(fakeTag._id),
    shopId: encodeShopOpaqueId(fakeTag.shopId)
  };
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});
beforeEach(async () => {
  await testApp.collections.Tags.insertOne(fakeTag);
});
afterEach(async () => {
  await testApp.collections.Tags.deleteMany({});
});

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
      // tag is returned unencoded diretly from mongoDB but is returned encoded from the mutation
      removedTag._id = encodeTagOpaqueId(removedTag._id);
      removedTag.heroMediaUrl = `https://shop.fake.site/${removedTag.heroMediaUrl}`;
      expect(removedTag).not.toBeNull();
      const result = await removeTag(tagInput);
      // mongoDB tag returns more fields than removeTag mutation, so objectContaining is to ensure returned fields match from db entry.
      expect(removedTag).toEqual(expect.objectContaining(result.removeTag.tag));
      removedTag = await testApp.collections.Tags.findOne({ _id: fakeTag._id, shopId: fakeTag.shopId });
      expect(removedTag).toBeNull();
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
});

import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Logger from "@reactioncommerce/logger";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateTagMutation = importAsString("./UpdateTagMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

let testApp;
let updateTag;
let mockTagsAccount;
let tagInput;

function createMockTag() {
  return Factory.Tag.makeOne({
    _id: "123",
    displayTitle: "Tag: Display Title",
    heroMediaUrl: "mediaurluri",
    isVisible: true,
    metafields: [],
    name: "Tag: Name",
    shopId: internalShopId,
    slug: "tag-slug"
  });
}

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  mockTagsAccount = Factory.Account.makeOne({
    roles: {
      [internalShopId]: ["admin"]
    }
  });

  await testApp.createUserAndAccount(mockTagsAccount);

  updateTag = testApp.mutate(UpdateTagMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Tags.deleteMany({});
  await testApp.stop();
});

beforeEach(async () => {
  tagInput = {
    id: encodeOpaqueId("reaction/tag", "123"),
    displayTitle: "Tag: Display Title",
    heroMediaUrl: "mediaurluri",
    isVisible: true,
    metafields: [],
    name: "Tag: Name",
    shopId: opaqueShopId,
    slug: "Tag: Slug"
  };
});


describe("unauthorized user", () => {
  const accountInternalId = "123";
  let logLevel;

  beforeAll(async () => {
    await testApp.setLoggedInUser({ _id: accountInternalId });
    await testApp.collections.Tags.insertOne(createMockTag());

    logLevel = Logger.level();
    Logger.level("FATAL");
  });

  afterAll(async () => {
    await testApp.collections.Tags.deleteMany({});
    await testApp.clearLoggedInUser();
    Logger.level(logLevel);
  });

  test("cannot update tag", async () => {
    expect.assertions(1);
    try {
      await updateTag(tagInput);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});

describe("authorized user", () => {
  beforeAll(async () => {
    await testApp.setLoggedInUser(mockTagsAccount);
  });

  beforeEach(async () => {
    await testApp.collections.Tags.insertOne(createMockTag());
  });

  afterAll(async () => {
    await testApp.clearLoggedInUser();
  });

  afterEach(async () => {
    await testApp.collections.Tags.deleteMany({});
  });

  test("can update tag with slug converted at save", async () => {
    let result;

    try {
      result = await updateTag({
        id: encodeOpaqueId("reaction/tag", "123"),
        displayTitle: "Tag: Display Title",
        heroMediaUrl: "mediaurluri",
        isVisible: true,
        metafields: [
          { key: "og:title", value: "Running Shoes", namespace: "meta" }
        ],
        name: "Running Shoes",
        shopId: opaqueShopId,
        slug: "Running Shoes"
      });
    } catch (error) {
      expect(error).toBeUndefined();
    }

    expect(result.updateTag.tag.name).toEqual("Running Shoes");
    expect(result.updateTag.tag.slug).toEqual("running-shoes");
    expect(result.updateTag.tag.metafields[0]).toEqual({
      key: "og:title",
      value: "Running Shoes",
      namespace: "meta"
    });
  });

  test("can update tag with invalid slug(empty string defaults to name) at save", async () => {
    let result;

    try {
      result = await updateTag({
        id: encodeOpaqueId("reaction/tag", "123"),
        displayTitle: "Tag: Display Title",
        heroMediaUrl: "mediaurluri",
        isVisible: true,
        metafields: [],
        name: "Stripped Socks",
        shopId: opaqueShopId
      });
    } catch (error) {
      expect(error).toBeUndefined();
    }

    expect(result.updateTag.tag.slug).toEqual("stripped-socks");
  });

  test("cannot update tag with existing slug", async () => {
    const logLevel = Logger.level();
    const duplicateTagSlug = Factory.Tag.makeOne({
      slug: "tag-slug"
    });
    Logger.level("FATAL");
    expect.assertions(1);
    try {
      await testApp.collections.Tags.insertOne(duplicateTagSlug);
    } catch (error) {
      expect(error.message).toEqual(expect.stringContaining("E11000 duplicate key error"));
    }
    Logger.level(logLevel);
  });
});

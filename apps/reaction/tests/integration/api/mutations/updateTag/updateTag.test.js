import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Logger from "@reactioncommerce/logger";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

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

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:tags/update"],
  slug: "admin",
  shopId: internalShopId
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
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockTagsAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId: internalShopId
  });

  await testApp.createUserAndAccount(mockTagsAccount);

  updateTag = testApp.mutate(UpdateTagMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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

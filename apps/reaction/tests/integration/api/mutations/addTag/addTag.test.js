import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Logger from "@reactioncommerce/logger";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddTagMutation = importAsString("./AddTagMutation.graphql");

jest.setTimeout(300000);

let testApp;
let shopId;
let addTag;
let mockTagsAccount;
let tagInput;

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

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:tags/create"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockTagsAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockTagsAccount);

  addTag = testApp.mutate(AddTagMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

beforeEach(async () => {
  tagInput = {
    displayTitle: "Tag: Display Title",
    heroMediaUrl: "mediaurluri",
    isVisible: true,
    metafields: [],
    name: "Tag: Name",
    shopId: encodeOpaqueId("reaction/shop", shopId),
    slug: "Tag: Slug"
  };
});


describe("unauthorized user", () => {
  const accountInternalId = "123";
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
  test("cannot create tag", async () => {
    expect.assertions(1);
    try {
      await addTag(tagInput);
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
  afterEach(async () => {
    await testApp.collections.Tags.deleteMany({});
  });
  test("can create tag with slug converted at save", async () => {
    let result;
    try {
      let savedTag = await testApp.collections.Tags.findOne({ slug: "tag-slug" });
      expect(savedTag).toBeNull();
      result = await addTag(tagInput);
      savedTag = await testApp.collections.Tags.findOne({ slug: "tag-slug" });
    } catch (error) {
      expect(error).toBeUndefined();
    }

    // slug is converted when saving slug.
    tagInput.slug = "tag-slug";
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    // check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("can create tag with slug from name at save", async () => {
    let result;
    delete tagInput.slug;
    try {
      let savedTag = await testApp.collections.Tags.findOne({ slug: "tag-name" });
      expect(savedTag).toBeNull();
      result = await addTag(tagInput);
      savedTag = await testApp.collections.Tags.findOne({ slug: "tag-name" });
      expect(savedTag).not.toBeNull();
      expect(savedTag.slug).toEqual("tag-name");
    } catch (error) {
      expect(error).toBeUndefined();
    }
    // slug is converted when saving slug.
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    // check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("can create tag with invalid slug(empty string defaults to name) at save", async () => {
    let result;
    tagInput.slug = "";
    try {
      result = await addTag(tagInput);
    } catch (error) {
      expect(error).toBeUndefined();
    }

    // slug is converted when saving slug.
    tagInput.slug = "tag-name";
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    // check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("cannot create tag with existing slug", async () => {
    const logLevel = Logger.level();
    const duplicateTagSlug = Factory.Tag.makeOne({
      slug: "tag-slug"
    });
    await testApp.collections.Tags.insertOne(duplicateTagSlug);
    Logger.level("FATAL");
    expect.assertions(1);
    try {
      await addTag(tagInput);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
    Logger.level(logLevel);
  });
});

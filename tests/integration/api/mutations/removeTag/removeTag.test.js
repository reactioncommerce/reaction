import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Logger from "@reactioncommerce/logger";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const RemoveTagMutation = importAsString("./RemoveTagMutation.graphql");

jest.setTimeout(300000);

let testApp;
let shopId;
let removeTag;
let mockTagsAccount;
let tagInput;
let fakeTag;

const accountInternalId = "123";

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
    permissions: ["reaction:legacy:tags/delete"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockTagsAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockTagsAccount);

  removeTag = testApp.mutate(RemoveTagMutation);

  fakeTag = Factory.Tag.makeOne({
    _id: "tagId",
    shopId
  });

  tagInput = {
    id: encodeOpaqueId("reaction/tag", fakeTag._id),
    shopId: encodeOpaqueId("reaction/shop", fakeTag.shopId)
  };
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
      // tag is returned unencoded directly from mongoDB but is returned encoded from the mutation
      removedTag._id = encodeOpaqueId("reaction/tag", removedTag._id);
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

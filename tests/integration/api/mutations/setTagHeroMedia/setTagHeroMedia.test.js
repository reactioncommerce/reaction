import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const setTagHeroMedia = importAsString("./setTagHeroMedia.graphql");

jest.setTimeout(300000);

const shopId = "123";
const tagId = "456";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const opaqueTagId = encodeOpaqueId("reaction/tag", tagId); // reaction/tag:456
const shopName = "Test Shop";

const mockMediaRecord = {
  _id: "mediaRecord-1",
  original: {
    name: "hats.jpg",
    size: 120629,
    type: "image/jpeg",
    updatedAt: "2018-06-25T17:20:47.335Z",
    uploadedAt: "2018-06-25T17:21:11.192Z"
  },
  metadata: {
    ownerId: "NGn6GR8L7DfWnfGCh",
    shopId: "shopId",
    priority: 1,
    toGrid: 1,
    workflow: "published"
  },
  copies: {
    image: {
      name: "hats.jpg",
      type: "image/jpeg",
      key: "5b312541d2bc3f00fe7cab1c",
      storageAdapter: "gridfs",
      size: 103909,
      updatedAt: "2018-06-25T17:24:17.717Z",
      createdAt: "2018-06-25T17:24:17.717Z"
    },
    large: {
      name: "hats.jpg",
      type: "image/jpeg",
      key: "5b312541d2bc3f00fe7cab1e",
      storageAdapter: "gridfs",
      size: 49330,
      updatedAt: "2018-06-25T17:24:17.789Z",
      createdAt: "2018-06-25T17:24:17.789Z"
    }
  }
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:tags/update"],
  slug: "admin",
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId
});

const mockTag = Factory.Tag.makeOne({
  _id: tagId,
  displayTitle: "Tag: Display Title",
  heroMediaUrl: "mediaurluri",
  isVisible: true,
  metafields: [],
  name: "Tag: Name",
  shopId,
  slug: "tag-slug"
});

let testApp;
let setTagHeroMediaMutation;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.collections.Tags.insertOne(mockTag);
  setTagHeroMediaMutation = testApp.mutate(setTagHeroMedia);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot set the hero media URL for a tag", async () => {
  try {
    await setTagHeroMediaMutation({
      input: {
        id: opaqueTagId,
        fileRecord: mockMediaRecord,
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("an admin user can set the hero media URL for a tag", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  // Mock MediaRecords and Media because files plugin isn't registered
  // for integration tests.
  testApp.context.collections.Media = { name: "images" };
  testApp.context.collections.MediaRecords = {
    insertOne: () => ({ insertedId: "1234" })
  };

  try {
    result = await setTagHeroMediaMutation({
      input: {
        id: opaqueTagId,
        fileRecord: mockMediaRecord,
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { id } = decodeOpaqueId(result.setTagHeroMedia.tag._id);
  expect(id).toEqual("456");
  expect(result.setTagHeroMedia.tag.heroMediaUrl).toContain("hats.jpg");
});

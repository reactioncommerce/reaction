import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import AddTagMutation from "./AddTagMutation.graphql";
import Logger from "@reactioncommerce/logger";

let testApp;
let shopId;
let addTag;
let mockTagsAccount;
let tagInput;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockTagsAccount = Factory.Accounts.makeOne({
    roles: {
      [shopId]: ["admin"]
    }
  });
  await testApp.createUserAndAccount(mockTagsAccount);

  addTag = testApp.mutate(AddTagMutation);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});
beforeEach(async() => {
  tagInput = {
    displayTitle: "Tag: Display Title",
    heroMediaUrl: "mediaurluri",
    isVisible: true,
    metafields: [],
    name: "Tag: Name",
    shopId: encodeShopOpaqueId(shopId),
    slug: "Tag: Slug" };
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
  test("cannot create tag", async () => {
    expect.assertions(1);
    let result;
    try{
      result = await addTag(tagInput);
    } catch(error) {
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
  })
  afterEach(async () => {
    await testApp.collections.Tags.deleteMany({});
  })
  test("can create tag with slug converted at save", async() => {
    let result;
    try{
      result = await addTag(tagInput);
    } catch(error) {
      expect(error).toBeUndefined();
    }

    //slug is converted when saving slug.
    tagInput.slug = "tag-slug";
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    //check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("can create tag with slug from name at save", async() => {
    let result;
    delete tagInput.slug;
    try{
      result = await addTag(tagInput);
    } catch(error) {
      expect(error).toBeUndefined();
    }

    //slug is converted when saving slug.
    tagInput.slug = "tag-name";
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    //check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("can create tag with invalid slug(empty string defaults to name) at save", async() => {
    let result;
    tagInput.slug = "";
    try{
      result = await addTag(tagInput);
    } catch(error) {
      expect(error).toBeUndefined();
    }

    //slug is converted when saving slug.
    tagInput.slug = "tag-name";
    tagInput.heroMediaUrl = `https://shop.fake.site/${tagInput.heroMediaUrl}`;
    delete tagInput.shopId;

    //check that the return tag has the correct information.
    expect(result.addTag.tag).toEqual(expect.objectContaining(tagInput));
  });
  test("cannot create tag with existing slug", async() => {
    let result;
    let logLevel = Logger.level();
    let duplicateTagSlug = Factory.Tag.makeOne({
      slug: "tag-slug"
    });
    await testApp.collections.Tags.insertOne(duplicateTagSlug);
    Logger.level("FATAL");
    expect.assertions(1);
    try{
      result = await addTag(tagInput);
    } catch(error) {
      expect(error).toMatchSnapshot();
    }
    Logger.level(logLevel);
  });
});

import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateShopMutation = importAsString("./UpdateShopMutation.graphql");

jest.setTimeout(300000);

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
    },
    medium: {
      name: "hats.jpg",
      type: "image/jpeg",
      key: "5b312541d2bc3f00fe7cab20",
      storageAdapter: "gridfs",
      size: 20087,
      updatedAt: "2018-06-25T17:24:17.838Z",
      createdAt: "2018-06-25T17:24:17.838Z"
    },
    small: {
      name: "hats.png",
      type: "image/png",
      key: "5b312541d2bc3f00fe7cab22",
      storageAdapter: "gridfs",
      size: 150789,
      updatedAt: "2018-06-25T17:24:17.906Z",
      createdAt: "2018-06-25T17:24:17.906Z"
    },
    thumbnail: {
      name: "hats.png",
      type: "image/png",
      key: "5b312541d2bc3f00fe7cab24",
      storageAdapter: "gridfs",
      size: 27795,
      updatedAt: "2018-06-25T17:24:17.946Z",
      createdAt: "2018-06-25T17:24:17.946Z"
    }
  }
};

let testApp;
let updateShop;
let shopId;
let mockAdminAccount;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  testApp.collections.MediaRecords.insertOne(mockMediaRecord);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:shops/update"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockAdminAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  updateShop = testApp.mutate(UpdateShopMutation);
});

afterAll(async () => {
  await testApp.collections.MediaRecords.deleteMany();
  await testApp.collections.Accounts.deleteMany();
  await testApp.collections.Shops.deleteMany();
  await testApp.collections.Groups.deleteMany();
  await testApp.stop();
});

test("user with `reaction:legacy:shops/update` permission can update various shop settings", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const mockShopSettings = {
    addressBook: [
      {
        address1: "302 Main Street",
        address2: "#202",
        city: "Santa Monica",
        company: "Reaction Commerce Inc",
        country: "US",
        fullName: "my full name",
        isBillingDefault: true,
        isCommercial: true,
        isShippingDefault: true,
        phone: "3105202522",
        postal: "94524",
        region: "CA"
      }
    ],
    allowGuestCheckout: true,
    brandAssets: encodeOpaqueId("reaction/mediaRecord", "mediaRecord-1"),
    defaultParcelSize: {
      width: 20,
      length: 20,
      height: 10,
      weight: 15
    },
    description: "My shop is super awesome!",
    emails: [
      {
        address: "admin@myshop.com",
        provides: "default",
        verified: true
      }
    ],
    keywords: "My shops keywords",
    name: "My Awesome Shop",
    shopLogoUrls: {
      primaryShopLogoUrl: "https://myshop-logo-url.com"
    },
    slug: "my-shop-slug",
    storefrontUrls: {
      storefrontOrdersUrl: "https://mystorefront-orders-url.com"
    }
  };

  let result;
  try {
    result = await updateShop({
      input: {
        shopId: encodeOpaqueId("reaction/shop", shopId),
        ...mockShopSettings
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const expectedShopSettings = {
    ...mockShopSettings,
    brandAssets: {
      navbarBrandImage: {
        large: "https://shop.fake.site/assets/files/Media/mediaRecord-1/large/hats.jpg",
        medium: "https://shop.fake.site/assets/files/Media/mediaRecord-1/medium/hats.jpg",
        original: "https://shop.fake.site/assets/files/Media/mediaRecord-1/image/hats.jpg",
        small: "https://shop.fake.site/assets/files/Media/mediaRecord-1/small/hats.png",
        thumbnail: "https://shop.fake.site/assets/files/Media/mediaRecord-1/thumbnail/hats.png"
      },
      navbarBrandImageId: "mediaRecord-1"
    }
  };

  expect(result.updateShop.shop).toEqual(expectedShopSettings);
});

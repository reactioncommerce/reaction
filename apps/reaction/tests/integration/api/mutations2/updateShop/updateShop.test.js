import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const UpdateShopMutation = importAsString("./UpdateShopMutation.graphql");

jest.setTimeout(300000);

let testApp;
let updateShop;
let shopId;
let mockAdminAccount;
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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
    brandAssets: null
  };

  expect(result.updateShop.shop).toEqual(expectedShopSettings);
});

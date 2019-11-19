import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateShopMutation = importAsString("./UpdateShopMutation.graphql");

jest.setTimeout(300000);

let testApp;
let updateShop;
let shopId;
let mockAdminAccount;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    roles: {
      [shopId]: ["admin"]
    }
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  updateShop = testApp.mutate(UpdateShopMutation);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany();
  await testApp.collections.Shops.deleteMany();
  await testApp.stop();
});

test("user with admin/owner roles can update various shop settings", async () => {
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

  expect(result.updateShop.shop).toEqual(mockShopSettings);
});

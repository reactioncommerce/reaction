import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const addCartItemsMutation = importAsString("./addCartItemsMutation.graphql");

jest.setTimeout(300000);

let addCartItems;
let catalogItem;
let items;
let mockCart;
let mockCustomerAccount;
let opaqueCartId;
let shopId;
let testApp;
const cartToken = "TOKEN";

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
  addCartItems = testApp.mutate(addCartItemsMutation);

  // create mock product
  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        options: null,
        pricing: {
          USD: {
            compareAtPrice: 109.99,
            displayPrice: "$99.99 - $105.99",
            maxPrice: 105.99,
            minPrice: 99.99,
            price: 99.99
          }
        }
      })
    })
  });

  await testApp.collections.Catalog.insertOne(catalogItem);

  const customerGroup = Factory.Group.makeOne({
    _id: "customerGroup",
    createdBy: null,
    name: "customer",
    permissions: ["customer"],
    slug: "customer",
    shopId
  });
  await testApp.collections.Groups.insertOne(customerGroup);

  // create mock customer account
  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccount",
    groups: [customerGroup._id],
    shopId
  });

  // create mock cart
  mockCart = Factory.Cart.makeOne({
    shopId,
    accountId: mockCustomerAccount._id,
    anonymousAccessToken: hashToken(cartToken),
    shipping: null,
    items: [],
    workflow: null
  });
  opaqueCartId = encodeOpaqueId("reaction/cart", mockCart._id);
  await testApp.collections.Cart.insertOne(mockCart);

  items = [{
    price: {
      amount: 99.99,
      currencyCode: "USD"
    },
    productConfiguration: {
      productId: encodeOpaqueId("reaction/product", catalogItem.product.productId),
      productVariantId: encodeOpaqueId("reaction/product", catalogItem.product.variants[0].variantId)
    },
    quantity: 1
  }];

  await testApp.createUserAndAccount(mockCustomerAccount);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user can add an item to their cart", async () => {
  let result;
  try {
    result = await addCartItems({ cartId: opaqueCartId, items, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addCartItems.cart.items.totalCount).toEqual(1);
});

test("a logged in user can add an item to their cart", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  let result;
  try {
    result = await addCartItems({ cartId: opaqueCartId, items });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addCartItems.cart.items.totalCount).toEqual(1);
});

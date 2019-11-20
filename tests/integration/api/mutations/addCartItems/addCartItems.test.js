import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const addCartItemsMutation = importAsString("./addCartItemsMutation.graphql");

jest.setTimeout(300000);

let addCartItems;
let catalogItem;
let mockCart;
let mockCustomerAccount;
let opaqueCartId;
let shopId;
let testApp;
const token = "TOKEN";

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
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

  // create mock cart
  mockCart = Factory.Cart.makeOne({
    shopId,
    anonymousAccessToken: hashToken(token),
    shipping: null,
    billing: null,
    taxSummary: null,
    items: [],
    workflow: null
  });
  opaqueCartId = encodeOpaqueId("reaction/cart", mockCart._id);
  await testApp.collections.Cart.insertOne(mockCart);

  mockCustomerAccount = Factory.Account.makeOne({
    _id: "mockCustomerAccount",
    roles: {
      [shopId]: []
    },
    shopId
  });

  await testApp.createUserAndAccount(mockCustomerAccount);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Cart.deleteMany({});
  await testApp.collections.Catalog.deleteMany({});
  await testApp.stop();
});

test("an anonymous user can add an item to their cart", async () => {
  const items = [{
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

  const cartInput = { cartId: opaqueCartId, items, token };
  let result;
  try {
    result = await addCartItems(cartInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addCartItems.cart.items.totalCount).toEqual(1);
});

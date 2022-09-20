import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AnonymousCartByCartIdQuery = importAsString("./AnonymousCartByCartIdQuery.graphql");
const addCartItemsMutation = importAsString("./addCartItemsMutation.graphql");

jest.setTimeout(300000);

let addCartItems;
let anonymousCartByCartId;
let mockCart;
let opaqueCartId;
let shopId;
let testApp;
let testCatalogItemId;
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
  anonymousCartByCartId = testApp.query(AnonymousCartByCartIdQuery);
  addCartItems = testApp.mutate(addCartItemsMutation);

  // create mock cart
  mockCart = Factory.Cart.makeOne({
    shopId,
    anonymousAccessToken: hashToken(cartToken),
    shipping: null,
    items: [],
    workflow: null
  });

  opaqueCartId = encodeOpaqueId("reaction/cart", mockCart._id);
  await testApp.collections.Cart.insertOne(mockCart);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user can retrieve their cart", async () => {
  let result;
  try {
    result = await anonymousCartByCartId({ cartId: opaqueCartId, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.anonymousCartByCartId._id).toEqual(opaqueCartId);
});

test("anonymous cart query works after a related catalog product is hidden", async () => {
  // create mock product
  const catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    isVisible: true,
    product: Factory.CatalogProduct.makeOne({
      productId: "1",
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        variantId: "v1",
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

  const { insertedId } = await testApp.collections.Catalog.insertOne(catalogItem);

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

  let result;
  try {
    await addCartItems({ cartId: opaqueCartId, items, cartToken });

    await testApp.collections.Catalog.updateOne({
      _id: insertedId
    }, {
      $set: {
        "product.isVisible": false
      }
    });

    result = await anonymousCartByCartId({ cartId: opaqueCartId, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.anonymousCartByCartId._id).toBe(opaqueCartId);
  expect(result.anonymousCartByCartId.items.nodes.length).toBe(1);
});

test("anonymous cart query works after a related catalog product is deleted", async () => {
  // create mock product
  const catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    isVisible: true,
    product: Factory.CatalogProduct.makeOne({
      productId: "2",
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        variantId: "v2",
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

  const { insertedId } = await testApp.collections.Catalog.insertOne(catalogItem);
  testCatalogItemId = insertedId;

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

  let result;
  try {
    await addCartItems({ cartId: opaqueCartId, items, cartToken });

    await testApp.collections.Catalog.updateOne({
      _id: insertedId
    }, {
      $set: {
        "product.isDeleted": true
      }
    });

    result = await anonymousCartByCartId({ cartId: opaqueCartId, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.anonymousCartByCartId._id).toBe(opaqueCartId);
  expect(result.anonymousCartByCartId.items.nodes.length).toBe(1);
});

test("anonymous cart query works after a related catalog product variant is deleted or hidden", async () => {
  let result;
  try {
    await testApp.collections.Catalog.updateOne({
      _id: testCatalogItemId
    }, {
      $set: {
        "product.variants": []
      }
    });

    result = await anonymousCartByCartId({ cartId: opaqueCartId, cartToken });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.anonymousCartByCartId._id).toBe(opaqueCartId);
  expect(result.anonymousCartByCartId.items.nodes.length).toBe(1);
});

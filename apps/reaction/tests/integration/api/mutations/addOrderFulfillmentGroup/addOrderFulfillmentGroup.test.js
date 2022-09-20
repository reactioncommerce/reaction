import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Random from "@reactioncommerce/random";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddOrderFulfillmentGroupMutation = importAsString("./AddOrderFulfillmentGroupMutation.graphql");

jest.setTimeout(300000);

let testApp;
let addOrderFulfillmentGroup;
let catalogItem;
let catalogItem2;
let mockOrdersAccount;
let shopId;

const variant1Price = 10;
const variant2Price = 5;
const fulfillmentMethodId = "METHOD_ID";
const mockShipmentMethod = {
  _id: fulfillmentMethodId,
  handling: 0,
  label: "mockLabel",
  name: "mockName",
  rate: 3.99
};

const mockInvoice = Factory.OrderInvoice.makeOne({
  currencyCode: "USD",
  // Need to ensure 0 discount to avoid creating negative totals
  discounts: 0
});
delete mockInvoice._id; // bug in Factory pkg

beforeAll(async () => {
  const getFulfillmentMethodsWithQuotes = (context, commonOrderExtended, [rates]) => {
    rates.push({
      carrier: "CARRIER",
      handlingPrice: 0,
      method: mockShipmentMethod,
      rate: 3.99,
      shippingPrice: 3.99,
      shopId
    });
  };

  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);

  testApp.registerPlugin({
    name: "addOrderFulfillmentGroup.test.js",
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });

  await testApp.start();

  shopId = await insertPrimaryShop(testApp.context);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:orders/move:item", "reaction:legacy:orders/update"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockOrdersAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOrdersAccount);

  catalogItem = Factory.Catalog.makeOne({
    _id: Random.id(),
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      _id: Random.id(),
      isDeleted: false,
      isVisible: true,
      productId: Random.id(),
      variants: Factory.CatalogProductVariant.makeMany(1, {
        _id: Random.id(),
        options: null,
        pricing: {
          USD: {
            price: variant1Price
          }
        },
        variantId: Random.id()
      })
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  catalogItem2 = Factory.Catalog.makeOne({
    _id: Random.id(),
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      _id: Random.id(),
      isDeleted: false,
      isVisible: true,
      productId: Random.id(),
      variants: Factory.CatalogProductVariant.makeMany(1, {
        _id: Random.id(),
        options: null,
        pricing: {
          USD: {
            price: variant2Price
          }
        },
        variantId: Random.id()
      })
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem2);

  // Disable the flat rates pkg so that only our getFulfillmentMethodsWithQuotes fn is used
  await testApp.collections.AppSettings.updateOne(
    { shopId },
    {
      $set: {
        isShippingRatesFulfillmentEnabled: false
      }
    },
    { upsert: true }
  );

  addOrderFulfillmentGroup = testApp.mutate(AddOrderFulfillmentGroupMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user with `reaction:legacy:orders/update` role can add an order fulfillment group with new items", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    price: {
      amount: variant1Price,
      currencyCode: "USD"
    },
    productId: catalogItem.product.productId,
    quantity: 2,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "STATUS",
      workflow: ["new", "STATUS"]
    }
  });

  const group = Factory.OrderFulfillmentGroup.makeOne({
    invoice: mockInvoice,
    items: [orderItem],
    shopId
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    currencyCode: "USD",
    referenceId: "1",
    shipping: [group],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  const shippingAddress = { ...group.address };
  delete shippingAddress._id;
  delete shippingAddress.failedValidation;

  let result;
  try {
    result = await addOrderFulfillmentGroup({
      fulfillmentGroup: {
        data: {
          shippingAddress
        },
        items: [{
          price: variant2Price,
          productConfiguration: {
            productId: encodeOpaqueId("reaction/product", catalogItem2.product.productId),
            productVariantId: encodeOpaqueId("reaction/product", catalogItem2.product.variants[0].variantId)
          },
          quantity: 5
        }],
        selectedFulfillmentMethodId: encodeOpaqueId("reaction/fulfillmentMethod", fulfillmentMethodId),
        shopId: encodeOpaqueId("reaction/shop", shopId),
        type: "shipping"
      },
      orderId: encodeOpaqueId("reaction/order", order._id)
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { newFulfillmentGroupId, order: updatedOrder } = result.addOrderFulfillmentGroup;

  expect(updatedOrder).toEqual({
    fulfillmentGroups: [
      {
        items: {
          nodes: [
            {
              price: {
                amount: orderItem.price.amount
              },
              productConfiguration: {
                productId: encodeOpaqueId("reaction/product", catalogItem.product.productId),
                productVariantId: encodeOpaqueId("reaction/product", catalogItem.product.variants[0].variantId)
              },
              quantity: 2,
              status: "STATUS"
            }
          ]
        },
        shop: { _id: encodeOpaqueId("reaction/shop", shopId) },
        status: "new",
        totalItemQuantity: 1,
        type: "shipping"
      },
      {
        items: {
          nodes: [
            {
              price: {
                amount: variant2Price
              },
              productConfiguration: {
                productId: encodeOpaqueId("reaction/product", catalogItem2.product.productId),
                productVariantId: encodeOpaqueId("reaction/product", catalogItem2.product.variants[0].variantId)
              },
              quantity: 5,
              status: "new"
            }
          ]
        },
        shop: { _id: encodeOpaqueId("reaction/shop", shopId) },
        status: "new",
        totalItemQuantity: 5,
        type: "shipping"
      }
    ]
  });

  expect(newFulfillmentGroupId).toEqual(jasmine.any(String));
});

test("user with `reaction:legacy:orders/move:item` role can add an order fulfillment group with moved items", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItemToStay = Factory.OrderItem.makeOne({
    price: {
      amount: variant1Price,
      currencyCode: "USD"
    },
    productId: catalogItem.product.productId,
    quantity: 2,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "STATUS",
      workflow: ["new", "STATUS"]
    }
  });

  const orderItemToMove = Factory.OrderItem.makeOne({
    price: {
      amount: variant2Price,
      currencyCode: "USD"
    },
    quantity: 10,
    productId: catalogItem2.product.productId,
    variantId: catalogItem2.product.variants[0].variantId,
    workflow: {
      status: "STATUS",
      workflow: ["new", "STATUS"]
    }
  });

  const group = Factory.OrderFulfillmentGroup.makeOne({
    invoice: mockInvoice,
    items: [orderItemToStay, orderItemToMove],
    itemIds: [orderItemToStay._id, orderItemToMove._id],
    shipmentMethod: {
      ...mockShipmentMethod,
      currencyCode: "USD"
    },
    shopId,
    totalItemQuantity: 12
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    currencyCode: "USD",
    referenceId: "2",
    shipping: [group],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  const shippingAddress = { ...group.address };
  delete shippingAddress._id;
  delete shippingAddress.failedValidation;

  let result;
  try {
    result = await addOrderFulfillmentGroup({
      fulfillmentGroup: {
        data: {
          shippingAddress
        },
        selectedFulfillmentMethodId: encodeOpaqueId("reaction/fulfillmentMethod", fulfillmentMethodId),
        shopId: encodeOpaqueId("reaction/shop", shopId),
        type: "shipping"
      },
      moveItemIds: [encodeOpaqueId("reaction/orderItem", orderItemToMove._id)],
      orderId: encodeOpaqueId("reaction/order", order._id)
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { newFulfillmentGroupId, order: updatedOrder } = result.addOrderFulfillmentGroup;

  expect(updatedOrder).toEqual({
    fulfillmentGroups: [
      {
        items: {
          nodes: [
            {
              price: {
                amount: orderItemToStay.price.amount
              },
              productConfiguration: {
                productId: encodeOpaqueId("reaction/product", catalogItem.product.productId),
                productVariantId: encodeOpaqueId("reaction/product", catalogItem.product.variants[0].variantId)
              },
              quantity: 2,
              status: "STATUS"
            }
          ]
        },
        shop: { _id: encodeOpaqueId("reaction/shop", shopId) },
        status: "new",
        totalItemQuantity: 2,
        type: "shipping"
      },
      {
        items: {
          nodes: [
            {
              price: {
                amount: variant2Price
              },
              productConfiguration: {
                productId: encodeOpaqueId("reaction/product", catalogItem2.product.productId),
                productVariantId: encodeOpaqueId("reaction/product", catalogItem2.product.variants[0].variantId)
              },
              quantity: 10,
              status: "STATUS"
            }
          ]
        },
        shop: { _id: encodeOpaqueId("reaction/shop", shopId) },
        status: "new",
        totalItemQuantity: 10,
        type: "shipping"
      }
    ]
  });

  expect(newFulfillmentGroupId).toEqual(jasmine.any(String));
});

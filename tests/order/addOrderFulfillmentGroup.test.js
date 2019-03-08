import Factory from "/imports/test-utils/helpers/factory";
import Random from "@reactioncommerce/random";
import { encodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { encodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "../TestApp";
import AddOrderFulfillmentGroupMutation from "./AddOrderFulfillmentGroupMutation.graphql";

jest.setTimeout(300000);

let testApp;
let addOrderFulfillmentGroup;
let catalogItem;
let catalogItem2;
let mockOrdersAccount;
let shopId;

const fulfillmentMethodId = "METHOD_ID";

beforeAll(async () => {
  const getFulfillmentMethodsWithQuotes = (context, commonOrderExtended, [rates]) => {
    rates.push({
      carrier: "CARRIER",
      handlingPrice: 0,
      method: {
        _id: fulfillmentMethodId,
        handling: 0,
        label: "mockLabel",
        name: "mockName",
        rate: 3.99
      },
      rate: 3.99,
      shippingPrice: 3.99,
      shopId
    });
  };

  testApp = new TestApp({
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });

  await testApp.start();
  shopId = await testApp.insertPrimaryShop();

  mockOrdersAccount = Factory.Accounts.makeOne({
    roles: {
      [shopId]: ["orders"]
    }
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
      variants: Factory.CatalogVariantSchema.makeMany(1, {
        _id: Random.id(),
        options: null,
        price: 10,
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
      variants: Factory.CatalogVariantSchema.makeMany(1, {
        _id: Random.id(),
        options: null,
        price: 5,
        variantId: Random.id()
      })
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem2);

  addOrderFulfillmentGroup = testApp.mutate(AddOrderFulfillmentGroupMutation);
});

afterAll(async () => {
  await testApp.collections.Catalog.remove({});
  await testApp.collections.Shops.remove({});
  testApp.stop();
});

test("user with orders role can update an order", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    price: {
      amount: catalogItem.product.variants[0].price,
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
    items: [orderItem],
    shopId
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    shipping: [group],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await addOrderFulfillmentGroup({
      fulfillmentGroup: {
        items: [{
          price: catalogItem2.product.variants[0].price,
          productConfiguration: {
            productId: encodeProductOpaqueId(catalogItem2.product.productId),
            productVariantId: encodeProductOpaqueId(catalogItem2.product.variants[0].variantId)
          },
          quantity: 5
        }],
        selectedFulfillmentMethodId: encodeFulfillmentMethodOpaqueId(fulfillmentMethodId),
        shopId: encodeShopOpaqueId(shopId),
        type: "shipping"
      },
      orderId: encodeOrderOpaqueId(order._id)
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
                productId: encodeProductOpaqueId(catalogItem.product.productId),
                productVariantId: encodeProductOpaqueId(catalogItem.product.variants[0].variantId)
              },
              quantity: 2,
              status: "STATUS"
            }
          ]
        },
        shop: { _id: encodeShopOpaqueId(shopId) },
        status: "new",
        type: "shipping"
      },
      {
        items: {
          nodes: [
            {
              price: {
                amount: catalogItem2.product.variants[0].price
              },
              productConfiguration: {
                productId: encodeProductOpaqueId(catalogItem2.product.productId),
                productVariantId: encodeProductOpaqueId(catalogItem2.product.variants[0].variantId)
              },
              quantity: 5,
              status: "new"
            }
          ]
        },
        shop: { _id: encodeShopOpaqueId(shopId) },
        status: "new",
        type: "shipping"
      }
    ]
  });

  expect(newFulfillmentGroupId).toEqual(jasmine.any(String));
});

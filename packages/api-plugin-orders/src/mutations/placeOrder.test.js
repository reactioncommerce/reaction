import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "../tests/factory.js";
import placeOrder from "./placeOrder.js";

beforeEach(() => {
  jest.resetAllMocks();
  mockContext.getFunctionsOfType.mockReturnValue([]);
});

test("throws if order isn't supplied", async () => {
  await expect(placeOrder(mockContext, {})).rejects.toThrowErrorMatchingSnapshot();
});

test("places an anonymous $0 order with no cartId and no payments", async () => {
  mockContext.accountId = null;

  const selectedFulfillmentMethodId = "METHOD_ID";
  const selectedFulfillmentMethod = {
    _id: selectedFulfillmentMethodId,
    carrier: "CARRIER",
    label: "LABEL",
    name: "METHOD1"
  };
  const catalogProduct = Factory.CatalogProduct.makeOne();
  const catalogProductVariant = Factory.CatalogProductVariant.makeOne();

  mockContext.queries.findProductAndVariant = jest.fn().mockName("findProductAndVariant");
  mockContext.queries.findProductAndVariant.mockReturnValueOnce({
    catalogProduct,
    variant: catalogProductVariant
  });

  mockContext.queries.getVariantPrice = jest.fn().mockName("getVariantPrice");
  mockContext.queries.getVariantPrice.mockReturnValueOnce({
    price: 0
  });

  mockContext.queries.inventoryForProductConfiguration = jest.fn().mockName("inventoryForProductConfiguration");
  mockContext.queries.inventoryForProductConfiguration.mockReturnValueOnce({
    canBackorder: true,
    inventoryAvailableToSell: 10
  });

  mockContext.queries.getFulfillmentMethodsWithQuotes = jest.fn().mockName("getFulfillmentMethodsWithQuotes");
  mockContext.queries.getFulfillmentMethodsWithQuotes.mockReturnValueOnce([{
    method: selectedFulfillmentMethod,
    handlingPrice: 0,
    shippingPrice: 0,
    rate: 0
  }]);

  mockContext.queries.getDiscountsTotalForCart = jest.fn().mockName("getDiscountsTotalForCart");

  mockContext.queries.shopById = jest.fn().mockName("shopById");
  mockContext.queries.shopById.mockReturnValueOnce([{
    availablePaymentMethods: ["PAYMENT1"]
  }]);

  mockContext.queries.getDiscountsTotalForCart = jest.fn().mockName("getDiscountsTotalForCart").mockReturnValueOnce({
    discounts: [],
    appliedPromotions: [],
    total: 0
  });

  const orderInput = Factory.orderInputSchema.makeOne({
    billingAddress: null,
    cartId: null,
    currencyCode: "USD",
    email: "valid@email.address",
    ordererPreferredLanguage: "en",
    fulfillmentGroups: Factory.orderFulfillmentGroupInputSchema.makeMany(1, {
      items: Factory.orderItemInputSchema.makeMany(1, {
        quantity: 1,
        price: 0
      }),
      selectedFulfillmentMethodId,
      totalPrice: 0
    })
  });

  const { orders, token } = await placeOrder(mockContext, {
    order: orderInput
  });

  const [order] = orders;

  expect(order).toEqual({
    _id: jasmine.any(String),
    accountId: null,
    anonymousAccessTokens: [
      { hashedToken: jasmine.any(String), createdAt: jasmine.any(Date) }
    ],
    billingAddress: null,
    cartId: null,
    createdAt: jasmine.any(Date),
    currencyCode: orderInput.currencyCode,
    customFields: {},
    discounts: [],
    email: orderInput.email,
    ordererPreferredLanguage: "en",
    payments: [],
    referenceId: jasmine.any(String),
    shipping: [
      {
        _id: jasmine.any(String),
        address: undefined,
        invoice: {
          currencyCode: orderInput.currencyCode,
          discounts: 0,
          effectiveTaxRate: 0,
          shipping: 0,
          subtotal: 0,
          surcharges: 0,
          taxableAmount: 0,
          taxes: 0,
          total: 0
        },
        itemIds: [order.shipping[0].items[0]._id],
        items: [
          {
            _id: jasmine.any(String),
            addedAt: jasmine.any(Date),
            attributes: [
              {
                label: "mockAttributeLabel",
                value: "mockOptionTitle"
              }
            ],
            createdAt: jasmine.any(Date),
            optionTitle: catalogProductVariant.optionTitle,
            parcel: undefined,
            price: {
              amount: 0,
              currencyCode: orderInput.currencyCode
            },
            productId: catalogProduct.productId,
            productSlug: catalogProduct.slug,
            productTagIds: catalogProduct.tagIds,
            productType: catalogProduct.type,
            productVendor: catalogProduct.vendor,
            quantity: 1,
            shopId: catalogProduct.shopId,
            subtotal: 0,
            title: catalogProduct.title,
            updatedAt: jasmine.any(Date),
            variantId: catalogProductVariant.variantId,
            variantTitle: catalogProductVariant.title,
            workflow: {
              status: "new",
              workflow: [
                "coreOrderWorkflow/created",
                "coreItemWorkflow/removedFromInventoryAvailableToSell"
              ]
            }
          }
        ],
        shipmentMethod: {
          ...selectedFulfillmentMethod,
          group: undefined,
          currencyCode: orderInput.currencyCode,
          handling: 0,
          rate: 0,
          discount: 0
        },
        shopId: orderInput.shopId,
        totalItemQuantity: 1,
        type: "mockType",
        workflow: {
          status: "new",
          workflow: [
            "new"
          ]
        }
      }
    ],
    shopId: orderInput.shopId,
    surcharges: [],
    totalItemQuantity: 1,
    updatedAt: jasmine.any(Date),
    workflow: {
      status: "new",
      workflow: ["new"]
    },
    appliedPromotions: []
  });

  expect(token).toEqual(jasmine.any(String));
});

test("should throw invalid-cart error when the a cart message is not acknowledged", async () => {
  mockContext.accountId = null;

  const selectedFulfillmentMethodId = "METHOD_ID";

  mockContext.queries.shopById = jest.fn().mockName("shopById").mockReturnValueOnce([{
    availablePaymentMethods: ["PAYMENT1"]
  }]);

  const cart = {
    _id: "cartId",
    messages: [
      { _id: "testId", requiresReadAcknowledgement: true, acknowledged: false }
    ]
  };
  mockContext.queries.getCartById = jest.fn().mockName("getCartById").mockResolvedValueOnce(cart);

  mockContext.collections = {
    Cart: {
      findOne: jest.fn().mockName("findOne").mockResolvedValue(cart)
    }
  };

  const orderInput = Factory.orderInputSchema.makeOne({
    billingAddress: null,
    cartId: "cartId",
    currencyCode: "USD",
    email: "valid@email.address",
    ordererPreferredLanguage: "en",
    fulfillmentGroups: Factory.orderFulfillmentGroupInputSchema.makeMany(1, {
      items: Factory.orderItemInputSchema.makeMany(1, {
        quantity: 1,
        price: 0
      }),
      selectedFulfillmentMethodId,
      totalPrice: 0
    })
  });

  try {
    await placeOrder(mockContext, {
      order: orderInput
    });
  } catch (error) {
    expect(error.error).toBe("invalid-cart");
    expect(error.message).toBe("Cart messages should be acknowledged before placing order");
  }
});

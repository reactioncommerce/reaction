/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory"; // TODO: remove cross-plugin import (https://github.com/reactioncommerce/reaction/issues/5653)
import getDataForOrderEmail from "./getDataForOrderEmail.js";

mockContext.queries.getPaymentMethodConfigByName = jest.fn().mockName("getPaymentMethodConfigByName").mockImplementation(() => ({
  functions: {
    listRefunds: async () => [{
      _id: "refundId",
      type: "refund",
      amount: 19.99,
      currency: "usd"
    }]
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function setupMocks(mockShop, mockCatalogItem) {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(mockShop);
  mockContext.collections.Catalog.toArray.mockReturnValueOnce([mockCatalogItem]);

  mockContext.queries.findVariantInCatalogProduct = jest.fn().mockName("findVariantInCatalogProduct");
  mockContext.queries.findVariantInCatalogProduct.mockReturnValueOnce({
    catalogProduct: mockCatalogItem.product,
    variant: mockCatalogItem.product.variants[0]
  });
}

test("returns expected data structure (base case)", async () => {
  const mockCatalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        media: [
          {
            priority: 1,
            productId: "mockProductId",
            variantId: "mockVariantId",
            URLs: {
              large: "large.jpg",
              medium: "medium.jpg",
              original: "original.jpg",
              small: "small.jpg",
              thumbnail: "thumbnail.jpg"
            }
          }
        ],
        options: null,
        price: 10
      })
    })
  });

  const mockOrder = Factory.Order.makeOne({
    payments: Factory.Payment.makeMany(1, {
      name: "iou_example"
    })
  });

  const mockShop = Factory.Shop.makeOne({
    storefrontUrls: {
      storefrontHomeUrl: "http://example.com/storefrontHomeUrl",
      storefrontOrderUrl: "http://example.com/storefrontOrderUrl/:orderId?token=:token"
    }
  });

  setupMocks(mockShop, mockCatalogItem);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });

  expect(data).toEqual({
    billing: {
      address: {
        address: "mockAddress1 mockAddress2",
        city: "mockCity",
        postal: "mockPostal",
        region: "mockRegion"
      },
      adjustedTotal: jasmine.any(String),
      discounts: jasmine.any(String),
      payments: [
        {
          displayAmount: jasmine.any(String),
          displayName: "mockDisplayName"
        }
      ],
      refunds: jasmine.any(String),
      shipping: jasmine.any(String),
      subtotal: jasmine.any(String),
      taxes: jasmine.any(String),
      total: jasmine.any(String)
    },
    combinedItems: [
      {
        ...mockOrder.shipping[0].items[0],
        imageURLs: {
          large: "large.jpg",
          medium: "medium.jpg",
          original: "original.jpg",
          small: "small.jpg",
          thumbnail: "thumbnail.jpg"
        },
        placeholderImage: "https://app.mock/resources/placeholder.gif",
        price: {
          amount: jasmine.any(Number),
          currencyCode: "mockCurrencyCode",
          displayAmount: jasmine.any(String)
        },
        productConfiguration: {
          productId: "mockProductId",
          productVariantId: "mockVariantId"
        },
        productImage: "large.jpg",
        variantImage: "large.jpg",
        subtotal: {
          amount: jasmine.any(Number),
          currencyCode: "mockCurrencyCode",
          displayAmount: jasmine.any(String)
        }
      }
    ],
    contactEmail: jasmine.any(String),
    copyrightDate: jasmine.any(Number),
    homepage: "http://example.com/storefrontHomeUrl",
    legalName: "mockCompany",
    order: {
      ...mockOrder,
      shipping: [
        {
          ...mockOrder.shipping[0],
          items: [
            {
              ...mockOrder.shipping[0].items[0],
              imageURLs: {
                large: "large.jpg",
                medium: "medium.jpg",
                original: "original.jpg",
                small: "small.jpg",
                thumbnail: "thumbnail.jpg"
              },
              placeholderImage: "https://app.mock/resources/placeholder.gif",
              price: {
                amount: jasmine.any(Number),
                currencyCode: "mockCurrencyCode",
                displayAmount: jasmine.any(String)
              },
              productConfiguration: {
                productId: "mockProductId",
                productVariantId: "mockVariantId"
              },
              productImage: "large.jpg",
              variantImage: "large.jpg",
              subtotal: {
                amount: jasmine.any(Number),
                currencyCode: "mockCurrencyCode",
                displayAmount: jasmine.any(String)
              }
            }
          ]
        }
      ]
    },
    orderDate: jasmine.any(String),
    orderUrl: "http://example.com/storefrontOrderUrl/mockReferenceId?token=",
    physicalAddress: {
      address: "mockAddress1 mockAddress2",
      city: "mockCity",
      postal: "mockPostal",
      region: "mockRegion"
    },
    shipping: {
      address: {
        address: "mockAddress1 mockAddress2",
        city: "mockCity",
        postal: "mockPostal",
        region: "mockRegion"
      },
      carrier: "mockCarrier",
      tracking: "mockTracking"
    },
    shop: mockShop,
    shopName: "mockName",
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: "https://app.mock/resources/email-templates/facebook-icon.png",
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: "https://app.mock/resources/email-templates/google-plus-icon.png",
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: "https://app.mock/resources/email-templates/twitter-icon.png",
        link: "https://www.twitter.com"
      }
    }
  });
});

test("storefrontUrls is optional", async () => {
  const mockCatalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        media: [
          {
            priority: 1,
            productId: "mockProductId",
            variantId: "mockVariantId",
            URLs: {
              large: "large.jpg",
              medium: "medium.jpg",
              original: "original.jpg",
              small: "small.jpg",
              thumbnail: "thumbnail.jpg"
            }
          }
        ],
        options: null,
        price: 10
      })
    })
  });

  const mockOrder = Factory.Order.makeOne({
    payments: Factory.Payment.makeMany(1, {
      name: "iou_example"
    })
  });

  const mockShop = Factory.Shop.makeOne();

  setupMocks(mockShop, mockCatalogItem);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });
  expect(data.homepage).toBeNull();
  expect(data.orderUrl).toBeNull();
});

test("storefrontUrls does not use :token", async () => {
  const mockCatalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1, {
        media: [
          {
            priority: 1,
            productId: "mockProductId",
            variantId: "mockVariantId",
            URLs: {
              large: "large.jpg",
              medium: "medium.jpg",
              original: "original.jpg",
              small: "small.jpg",
              thumbnail: "thumbnail.jpg"
            }
          }
        ],
        options: null,
        price: 10
      })
    })
  });

  const mockOrder = Factory.Order.makeOne({
    payments: Factory.Payment.makeMany(1, {
      name: "iou_example"
    })
  });
  delete mockOrder.accountId;
  const mockShop = Factory.Shop.makeOne({
    storefrontUrls: {
      storefrontHomeUrl: "http://example.com/storefrontHomeUrl",
      storefrontOrderUrl: "http://example.com/storefrontOrderUrl/:orderId"
    }
  });

  setupMocks(mockShop, mockCatalogItem);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });
  expect(data.homepage).toBe(mockShop.storefrontUrls.storefrontHomeUrl);
  expect(data.orderUrl).toBe(`http://example.com/storefrontOrderUrl/${mockOrder.referenceId}`);
});

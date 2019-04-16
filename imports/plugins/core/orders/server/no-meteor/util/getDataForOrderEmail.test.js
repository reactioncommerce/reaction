import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import { restore, rewire$getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import getDataForOrderEmail from "./getDataForOrderEmail";

beforeAll(() => {
  rewire$getPaymentMethodConfigByName(() => ({
    functions: {
      listRefunds: () => []
    }
  }));
});

afterAll(() => {
  restore();
});

test("returns expected data structure", async () => {
  const mockCatalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogVariantSchema.makeMany(1, {
        media: [
          {
            priority: 1,
            toGrid: 1,
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

  mockContext.collections.Shops.findOne.mockReturnValueOnce(mockShop);
  mockContext.collections.Catalog.toArray.mockReturnValueOnce([mockCatalogItem]);

  const data = await getDataForOrderEmail(mockContext, mockOrder);

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
          currencyCode: "mockCurrencyCode"
        }
      }
    ],
    contactEmail: jasmine.any(String),
    copyrightDate: jasmine.any(Number),
    homepage: "https://app.mock/",
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
                currencyCode: "mockCurrencyCode"
              }
            }
          ]
        }
      ]
    },
    orderDate: jasmine.any(String),
    orderUrl: "cart/completed?_id=mockCartId",
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

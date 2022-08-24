/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "../tests/factory.js";
import getDataForOrderEmail from "./getDataForOrderEmail.js";

jest.mock("./imageURLs.js", () => jest.fn().mockImplementation(() => Promise.resolve({
  large: "large.jpg",
  medium: "medium.jpg",
  original: "original.jpg",
  small: "small.jpg",
  thumbnail: "thumbnail.jpg"
})));

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

function setupMocks(mockShop) {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(mockShop);
}

test("returns expected data structure (base case)", async () => {
  const mockOrder = Factory.Order.makeOne({
    accountId: "mockAccountId",
    payments: Factory.Payment.makeMany(1, {
      name: "iou_example"
    })
  });

  const mockShop = Factory.Shop.makeOne({
    addressBook: [
      {
        address1: "mockAddress1",
        address2: "mockAddress2",
        city: "mockCity",
        company: "mockCompany",
        country: "mockCountry",
        fullName: "mockFullName",
        postal: "mockPostal",
        region: "mockRegion"
      }
    ],
    storefrontUrls: {
      storefrontHomeUrl: "http://example.com/storefrontHomeUrl",
      storefrontOrderUrl: "http://example.com/storefrontOrderUrl/:orderId?token=:token"
    }
  });

  const mockAccount = {
    _id: "mockAccountId",
    name: "mockName"
  };
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

  setupMocks(mockShop);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });

  expect(data).toEqual({
    account: mockAccount,
    billing: {
      address: {
        address: "mockAddress1 mockAddress2",
        city: "mockCity",
        fullName: "mockFullName",
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
        productImage: "large.jpg",
        variantImage: "large.jpg",
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
              productImage: "large.jpg",
              variantImage: "large.jpg",
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
      address1: "mockAddress1",
      address2: "mockAddress2",
      city: "mockCity",
      company: "mockCompany",
      country: "mockCountry",
      fullName: "mockFullName",
      postal: "mockPostal",
      region: "mockRegion"
    },
    shipping: {
      address: {
        address: "mockAddress1 mockAddress2",
        city: "mockCity",
        fullName: "mockFullName",
        postal: "mockPostal",
        region: "mockRegion"
      },
      carrier: "mockCarrier",
      tracking: "mockTracking"
    },
    shop: mockShop,
    shopName: "mockName",
    socialLinks: {
      display: false
    }
  });
});

test("storefrontUrls is optional", async () => {
  const mockOrder = Factory.Order.makeOne({
    payments: Factory.Payment.makeMany(1, {
      name: "iou_example"
    })
  });

  const mockShop = Factory.Shop.makeOne({
    storefrontUrls: {}
  });

  setupMocks(mockShop);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });
  expect(data.homepage).toBeNull();
  expect(data.orderUrl).toBeNull();
});

test("storefrontUrls does not use :token", async () => {
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

  setupMocks(mockShop);

  const data = await getDataForOrderEmail(mockContext, { order: mockOrder });
  expect(data.homepage).toBe(mockShop.storefrontUrls.storefrontHomeUrl);
  expect(data.orderUrl).toBe(`http://example.com/storefrontOrderUrl/${mockOrder.referenceId}`);
});

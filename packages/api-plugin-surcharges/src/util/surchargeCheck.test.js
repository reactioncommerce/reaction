import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { surchargeCheck } from "./surchargeCheck.js";

// Create mock context with Surcharges collection
mockContext.collections.Surcharges = mockCollection("Surcharges");

const mockSurchargeWithAttributesAndLocation = [
  {
    _id: "9FNSPHfzYd9LpitJb",
    shopId: "J8Bhq3uTtdgwZx3rz",
    methodIds: [],
    type: "surcharge",
    attributes: [
      {
        property: "vendor",
        value: "Restricted Vendor",
        propertyType: "string",
        operator: "eq"
      }
    ],
    destination: {
      region: [
        "CA",
        "NY"
      ]
    },
    amount: {
      amount: 9.99,
      currencyCode: "USD"
    },
    message: "This surcharge applies because the product name is \"Basic Reaction Product\" and the destination is California or New York"
  }
];

const mockSurchargeWithAttributes = [
  {
    _id: "9FNSPHfzYd9LpitJb",
    shopId: "J8Bhq3uTtdgwZx3rz",
    methodIds: [],
    type: "surcharge",
    attributes: [
      {
        property: "vendor",
        value: "Restricted Vendor",
        propertyType: "string",
        operator: "eq"
      }
    ],
    destination: {},
    amount: {
      amount: 9.99,
      currencyCode: "USD"
    },
    message: "This surcharge applies because the product name is \"Basic Reaction Product\" and the destination is California or New York"
  },
  {
    _id: "9FNSPHfzYd9LpitJb",
    shopId: "J8Bhq3uTtdgwZx3rz",
    methodIds: [],
    type: "surcharge",
    attributes: [
      {
        property: "vendor",
        value: "Dog Industries",
        propertyType: "string",
        operator: "eq"
      }
    ],
    destination: {},
    amount: {
      amount: 9.99,
      currencyCode: "USD"
    },
    message: "This surcharge applies because the product name is \"Basic Reaction Product\" and the destination is California or New York"
  }
];

const mockSurchargeWithLocation = [
  {
    _id: "9FNSPHfzYd9LpitJb",
    shopId: "J8Bhq3uTtdgwZx3rz",
    methodIds: [],
    type: "surcharge",
    attributes: [],
    destination: {
      region: [
        "CA",
        "NY"
      ]
    },
    amount: {
      amount: 9.99,
      currencyCode: "USD"
    },
    message: "This surcharge applies because the product name is \"Basic Reaction Product\" and the destination is California or New York"
  }
];


// Mock cart items
const mockHydratedOrderItems = {
  _id: "tMkp5QwZog5ihYTfG",
  createdAt: "2018-11-01T16:42:03.448Z",
  description: "Represent the city that never sleeps with this classic T.",
  isDeleted: false,
  isTaxable: true,
  isVisible: true,
  pageTitle: "212. 646. 917.",
  price: 12.99,
  primaryImage: [Object],
  productId: "cR6LKN5yGSiei7cia",
  shopId: "J8Bhq3uTtdgwZx3rz",
  slug: "new-york-city-1998-t-shirt",
  supportedFulfillmentTypes: [Array],
  tagIds: [Array],
  title: "Small",
  type: "product-simple",
  updatedAt: "2018-11-01T16:42:03.448Z",
  vendor: "Restricted Vendor",
  height: 10,
  index: 0,
  length: 10,
  optionTitle: "Small",
  originCountry: "US",
  taxCode: "0000",
  variantId: "tMkp5QwZog5ihYTfG",
  weight: 50,
  width: 10,
  tags: [Array]
};

const mockExtendedCommonOrderCalifornia = {
  shippingAddress:
  {
    address1: "123 California Street",
    city: "Los Angeles",
    country: "US",
    postal: "90405",
    region: "CA"
  },
  discountTotal: 0,
  items:
  [mockHydratedOrderItems],
  itemTotal: 898.95,
  total: 898.95
};

const mockExtendedCommonOrderColorado = {
  shippingAddress:
  {
    address1: "123 Colorado Street",
    city: "Denver",
    country: "US",
    postal: "80231",
    region: "CO"
  },
  discountTotal: 0,
  items:
  [mockHydratedOrderItems],
  itemTotal: 898.95,
  total: 898.95
};

test("Attributes & Location true - Order with vendor \"Restricted Vendor\" and shipping location \"California\" should apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithAttributesAndLocation));

  const surchargeToTest = mockSurchargeWithAttributesAndLocation[0];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderCalifornia);

  expect(applySurcharge).toEqual(true);
});

test("Attributes & Location false - Order with vendor \"Restricted Vendor\" and shipping location \"Colorado\" should not apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithAttributesAndLocation));

  const surchargeToTest = mockSurchargeWithAttributesAndLocation[0];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderColorado);

  expect(applySurcharge).toEqual(false);
});

test("Attributes true - Order with vendor \"Restricted Vendor\" should apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithAttributes));

  const surchargeToTest = mockSurchargeWithAttributes[0];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderCalifornia);

  expect(applySurcharge).toEqual(true);
});

test("Attributes false - Order with vendor \"Dog Industries\" should not apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithAttributes));

  const surchargeToTest = mockSurchargeWithAttributes[1];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderColorado);

  expect(applySurcharge).toEqual(false);
});

test("Location true - Order with shipping location \"California\" should apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithLocation));

  const surchargeToTest = mockSurchargeWithLocation[0];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderCalifornia);

  expect(applySurcharge).toEqual(true);
});

test("Location false - Order with shipping location \"Colorado\" should not apply surcharge", async () => {
  mockContext.collections.Surcharges.toArray.mockReturnValue(Promise.resolve(mockSurchargeWithLocation));

  const surchargeToTest = mockSurchargeWithLocation[0];

  const applySurcharge = await surchargeCheck(surchargeToTest, mockExtendedCommonOrderColorado);

  expect(applySurcharge).toEqual(false);
});

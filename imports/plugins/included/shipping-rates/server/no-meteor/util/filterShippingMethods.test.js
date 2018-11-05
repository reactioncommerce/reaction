import filterShippingMethods from "./filterShippingMethods";
import mockContext, { mockCollection } from "/imports/test-utils/helpers/mockContext";

// Create mock context with FlatRateFulfillmentRestrictions collection
mockContext.collections.FlatRateFulfillmentRestrictions = mockCollection("FlatRateFulfillmentRestrictions");

// Mock shipping method
const mockShippingMethod = [
  {
    cost: 7.99,
    fulfillmentTypes: [
      "shipping"
    ],
    group: "Ground",
    handling: 0,
    label: "Ground",
    name: "Ground",
    rate: 7.99,
    _id: "stviZaLdqRvTKW6J5",
    enabled: true,
    code: "001"
  }
];

// Mock cart items
const mockHydratedCartItems = {
  _id: "tMkp5QwZog5ihYTfG",
  createdAt: "2018-11-01T16:42:03.448Z",
  description: "Represent the city that never sleeps with this classic T.",
  isBackorder: false,
  isDeleted: false,
  isLowQuantity: false,
  isSoldOut: false,
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
  vendor: "Erik",
  height: 10,
  index: 0,
  inventoryManagement: true,
  inventoryPolicy: false,
  length: 10,
  lowInventoryWarningThreshold: 0,
  optionTitle: "Small",
  originCountry: "US",
  taxCode: "0000",
  variantId: "tMkp5QwZog5ihYTfG",
  weight: 50,
  width: 10,
  tags: [Array]
};

const mockHydratedCart = {
  address:
  {
    address1: "123 California Street",
    city: "Los Angeles",
    country: "US",
    postal: "90405",
    region: "CA"
  },
  discountTotal: 0,
  items:
  [mockHydratedCartItems],
  itemTotal: 898.95,
  total: 898.95
};

test("allow method - country on allow list, region / zip not on deny list", async () => {
  // Allow list: { country: ["US"] }
  // Deny list: { region: ["AK", "HI"] }
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {
        country: [
          "US"
        ]
      }
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {
        region: [
          "AK",
          "HI"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("deny method - country on deny list", async () => {
  // Allow list: {}
  // Deny list: { country: ["US"] }
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {}
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {
        country: [
          "US"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual([]);
});

test("allow method - region on allow list, country / zip not on deny list", async () => {
  // Allow list: { region: ["CA"] }
  // Deny list: {}
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {
        region: [
          "CA"
        ]
      }
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {}
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("deny method - region on deny list", async () => {
  // Allow list: {}
  // Deny list: { country: ["US"] }
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {}
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {
        region: [
          "CA"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual([]);
});

test("allow method - zip on allow list, country / region not on deny list", async () => {
  // Allow list: { postal: ["90405"] }
  // Deny list: {}
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {
        postal: [
          "90405"
        ]
      }
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {}
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("deny method - zip on deny list", async () => {
  // Allow list: {}
  // Deny list: { country: ["US"] }
  // Shipping Location: US, CA, 90405

  const mockMethodRestrictions = [
    {
      _id: "allow001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "allow",
      destination: {}
    },
    {
      _id: "deny001",
      methodIds: [
        "stviZaLdqRvTKW6J5"
      ],
      type: "deny",
      destination: {
        postal: [
          "90405"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedCart);

  expect(allowedMethods).toEqual([]);
});

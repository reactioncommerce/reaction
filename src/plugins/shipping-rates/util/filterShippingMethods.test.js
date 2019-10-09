import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import filterShippingMethods from "./filterShippingMethods.js";

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

const mockHydratedOrder = {
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

/*
 * Tests with location restrictions that allow method
 */
test("allow method - country on allow list, region / zip not on deny list, no item restrictions", async () => {
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

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("allow method - region on allow list, country / zip not on deny list, no item restrictions", async () => {
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

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("allow method - postal on allow list, country / region not on deny list, no item restrictions", async () => {
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

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

/*
 * Tests with location restrictions AND attribute restrictions that allow method
 * Test should pass because Shipping location is not the restricted location
 */
test("allow method - do not allow shipping of `Restricted Vendor` to Canada, all other locations allowed", async () => {
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
      attributes: [
        {
          property: "vendor",
          value: "Restricted Vendor",
          propertyType: "string",
          operator: "eq"
        }
      ],
      destination: {
        country: [
          "CA"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("allow method - do not allow shipping of `Restricted Vendor` to Hawaii, all other locations allowed", async () => {
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
          "HI"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("allow method - do not allow shipping of `Restricted Vendor` to 10001, all other locations allowed", async () => {
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
      attributes: [
        {
          property: "vendor",
          value: "Restricted Vendor",
          propertyType: "string",
          operator: "eq"
        }
      ],
      destination: {
        postal: [
          "10001"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});

test("allow method - multiple attributes but only 1 meets criteria to deny", async () => {
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
      attributes: [
        {
          property: "total",
          value: 500,
          propertyType: "int",
          operator: "lt"
        },
        {
          property: "weight",
          value: 40,
          propertyType: "int",
          operator: "gt"
        }
      ]
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual(mockShippingMethod);
});


/*
 * Tests with location restrictions AND attribute restrictions that deny method
 * Test should fail because Shipping location is the restricted location
 */
test("deny method - do not allow shipping of `Restricted Vendor` to United States, all other locations allowed", async () => {
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
      attributes: [
        {
          property: "vendor",
          value: "Restricted Vendor",
          propertyType: "string",
          operator: "eq"
        }
      ],
      destination: {
        country: [
          "US"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - do not allow shipping of `Restricted Vendor` to California, all other locations allowed", async () => {
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
          "CA"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - do not allow shipping of `Restricted Vendor` to 90405, all other locations allowed", async () => {
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
      attributes: [
        {
          property: "vendor",
          value: "Restricted Vendor",
          propertyType: "string",
          operator: "eq"
        }
      ],
      destination: {
        postal: [
          "90405"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

/*
 * Tests with location restrictions that deny method
 */
test("deny method - country on deny list, no item restrictions", async () => {
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

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - region on deny list, no item restrictions", async () => {
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
          "CA"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - postal on deny list, no item restrictions", async () => {
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
        postal: [
          "90405"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - region on one deny list, but also is not on other deny lists", async () => {
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
          "CA"
        ]
      }
    },
    {
      _id: "deny002",
      methodIds: [
        "nUjYh7hYtbUh0Ojht7"
      ],
      type: "deny",
      destination: {
        region: [
          "NY"
        ]
      }
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

/*
 * Test with item / attribute restrictions that deny method
 */
test("deny method - vendor on deny list", async () => {
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
      attributes: [
        {
          property: "vendor",
          value: "Restricted Vendor",
          propertyType: "string",
          operator: "eq"
        }
      ]
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - item weight is too high", async () => {
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
      attributes: [
        {
          property: "weight",
          value: 40,
          propertyType: "int",
          operator: "gt"
        }
      ]
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - item value is less than $100", async () => {
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
      attributes: [
        {
          property: "price",
          value: 100,
          propertyType: "int",
          operator: "lt"
        }
      ]
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

test("deny method - multiple attributes - item value is less than $100 AND item weight is too high", async () => {
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
      attributes: [
        {
          property: "price",
          value: 100,
          propertyType: "int",
          operator: "lt"
        },
        {
          property: "weight",
          value: 40,
          propertyType: "int",
          operator: "gt"
        }
      ]
    }
  ];

  mockContext.collections.FlatRateFulfillmentRestrictions.toArray.mockReturnValue(Promise.resolve(mockMethodRestrictions));

  const allowedMethods = await filterShippingMethods(mockContext, mockShippingMethod, mockHydratedOrder);

  expect(allowedMethods).toEqual([]);
});

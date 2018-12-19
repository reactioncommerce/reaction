import mockContext from "/imports/test-utils/helpers/mockContext";
import getVariantInventoryNotAvailableToSellQuantity from "./getVariantInventoryNotAvailableToSellQuantity";

const mockCollections = { ...mockContext.collections };

const mockOrdersArray = [
  {
    _id: "123",
    shipping: [
      {
        _id: "XikuDrWa3JX5dZhhn",
        items: [
          {
            _id: "123a",
            addedAt: "2018-12-19T01:07:46.401Z",
            createdAt: "2018-12-19T01:08:22.904Z",
            isTaxable: false,
            optionTitle: "Red",
            parcel: {
              weight: 25,
              height: 3,
              width: 10,
              length: 10
            },
            price: {
              amount: 19.99,
              currencyCode: "USD"
            },
            productId: "123",
            productSlug: "basic-reaction-product",
            productType: "product-simple",
            productTagIds: [
              "rpjCvTBGjhBi2xdro",
              "cseCBSSrJ3t8HQSNP"
            ],
            productVendor: "Example Manufacturer",
            quantity: 1,
            shopId: "J8Bhq3uTtdgwZx3rz",
            subtotal: 19.99,
            title: "Basic Reaction Product",
            updatedAt: "2018-12-19T01:08:22.904Z",
            variantId: "456",
            variantTitle: "Option 1 - Red Dwarf",
            workflow: {
              status: "new",
              workflow: [
                "coreOrderWorkflow/created"
              ]
            },
            tax: 0,
            taxableAmount: 0,
            taxes: []
          }
        ]
      }
    ],
    totalItemQuantity: 2,
    workflow: {
      status: "coreOrderWorkflow/processing",
      workflow: [
        "coreOrderWorkflow/processing",
        "coreOrderWorkflow/created"
      ]
    }
  }, {
    _id: "456",
    shipping: [
      {
        _id: "XikuDrWa3JX5dZhhn",
        items: [
          {
            _id: "123a",
            addedAt: "2018-12-19T01:07:46.401Z",
            createdAt: "2018-12-19T01:08:22.904Z",
            isTaxable: false,
            optionTitle: "Red",
            parcel: {
              weight: 25,
              height: 3,
              width: 10,
              length: 10
            },
            price: {
              amount: 19.99,
              currencyCode: "USD"
            },
            productId: "123",
            productSlug: "basic-reaction-product",
            productType: "product-simple",
            productTagIds: [
              "rpjCvTBGjhBi2xdro",
              "cseCBSSrJ3t8HQSNP"
            ],
            productVendor: "Example Manufacturer",
            quantity: 1,
            shopId: "J8Bhq3uTtdgwZx3rz",
            subtotal: 19.99,
            title: "Basic Reaction Product",
            updatedAt: "2018-12-19T01:08:22.904Z",
            variantId: "456",
            variantTitle: "Option 1 - Red Dwarf",
            workflow: {
              status: "new",
              workflow: [
                "coreOrderWorkflow/created"
              ]
            },
            tax: 0,
            taxableAmount: 0,
            taxes: []
          }
        ]
      }
    ],
    totalItemQuantity: 2,
    workflow: {
      status: "coreOrderWorkflow/processing",
      workflow: [
        "coreOrderWorkflow/processing",
        "coreOrderWorkflow/created"
      ]
    }
  }, {
    _id: "789",
    shipping: [
      {
        _id: "XikuDrWa3JX5dZhhn",
        items: [
          {
            _id: "123a",
            addedAt: "2018-12-19T01:07:46.401Z",
            createdAt: "2018-12-19T01:08:22.904Z",
            isTaxable: false,
            optionTitle: "Red",
            parcel: {
              weight: 25,
              height: 3,
              width: 10,
              length: 10
            },
            price: {
              amount: 19.99,
              currencyCode: "USD"
            },
            productId: "123",
            productSlug: "basic-reaction-product",
            productType: "product-simple",
            productTagIds: [
              "rpjCvTBGjhBi2xdro",
              "cseCBSSrJ3t8HQSNP"
            ],
            productVendor: "Example Manufacturer",
            quantity: 1,
            shopId: "J8Bhq3uTtdgwZx3rz",
            subtotal: 19.99,
            title: "Basic Reaction Product",
            updatedAt: "2018-12-19T01:08:22.904Z",
            variantId: "456",
            variantTitle: "Option 1 - Red Dwarf",
            workflow: {
              status: "new",
              workflow: [
                "coreOrderWorkflow/created"
              ]
            },
            tax: 0,
            taxableAmount: 0,
            taxes: []
          }
        ]
      }
    ],
    totalItemQuantity: 2,
    workflow: {
      status: "coreOrderWorkflow/processing",
      workflow: [
        "coreOrderWorkflow/processing",
        "coreOrderWorkflow/created"
      ]
    }
  }
];

const mockVariants = [
  {
    _id: "456",
    inventoryInStock: 5
  }
];


test("expect single order with 1 item quantity reserved to return 1", async () => {
  mockCollections.Orders.toArray.mockReturnValueOnce(Promise.resolve([mockOrdersArray[0]]));
  const spec = await getVariantInventoryNotAvailableToSellQuantity(mockVariants[0], mockCollections);
  expect(spec).toEqual(1);
});

test("expect multiple orders with 3 item quantity reserved between orders to return 3", async () => {
  mockCollections.Orders.toArray.mockReturnValueOnce(Promise.resolve(mockOrdersArray));
  const spec = await getVariantInventoryNotAvailableToSellQuantity(mockVariants[0], mockCollections);
  expect(spec).toEqual(3);
});

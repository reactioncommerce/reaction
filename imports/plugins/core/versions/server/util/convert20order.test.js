import { convertOrder } from "./convert20";

const beforeOrder = {
  _id: "pLtmCazjBSy5F9uuu",
  accountId: "NGn6GR8L7DfWnfGCh",
  billing: [
    {
      shopId: "J8Bhq3uTtdgwZx3rz",
      currency: {
        userCurrency: "USD",
        exchangeRate: 1
      },
      _id: "other"
    },
    {
      paymentMethod: {
        processor: "Example",
        paymentPackageId: "euAJq7W8MzPJPm7Ne",
        paymentSettingsKey: "example-paymentmethod",
        storedCard: "Visa 1111",
        method: "credit",
        transactionId: "ur4eYdBoQQffQoquE",
        riskLevel: "normal",
        currency: "USD",
        amount: 738.97,
        status: "created",
        mode: "authorize",
        createdAt: new Date("2018-09-20T20:25:37.025+0000"),
        transactions: [
          {
            amount: 738.97,
            transactionId: "ur4eYdBoQQffQoquE",
            currency: "USD"
          }
        ],
        workflow: {

        }
      },
      invoice: {
        shipping: 2.99,
        subtotal: 735.98,
        taxes: 0,
        discounts: 0,
        total: 738.97
      },
      address: {
        country: "US",
        fullName: "Some Guy",
        address1: "2110 Main Street",
        address2: "Suite 207",
        postal: "90405",
        city: "Santa Monica",
        region: "CA",
        phone: "5555555555",
        isShippingDefault: true,
        isBillingDefault: true,
        isCommercial: false,
        _id: "u7HFEFBKhhGkGMPcB",
        failedValidation: false
      },
      shopId: "J8Bhq3uTtdgwZx3rz",
      currency: {
        userCurrency: "USD",
        exchangeRate: 1
      },
      _id: "WdupGyFiowxb54s8S"
    }
  ],
  currencyCode: "USD",
  createdAt: new Date("2018-09-20T20:25:37.253+0000"),
  items: [
    {
      _id: "zY9RxcqdgLvJ3zYRz",
      attributes: [
        {
          label: null,
          value: "Ticket to Anywhere"
        },
        {
          label: null,
          value: "Large"
        }
      ],
      isTaxable: false,
      optionTitle: "Large",
      parcel: {
        weight: 10,
        height: 10,
        width: 10,
        length: 1
      },
      priceWhenAdded: {
        amount: 35.99,
        currencyCode: "USD"
      },
      productId: "FjcfCt6qBBxLskWDn",
      productSlug: "ticket-to-anywhere-t-shirt",
      productVendor: "Wanderlust, Inc.",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Ticket to Anywhere T-Shirt",
      updatedAt: new Date("2018-09-20T19:30:53.025+0000"),
      variantId: "L9w5FsbEuxiTcYPCT",
      variantTitle: "Large",
      addedAt: new Date("2018-09-20T19:30:53.025+0000"),
      createdAt: new Date("2018-09-20T19:30:53.025+0000"),
      product: {
        _id: "FjcfCt6qBBxLskWDn",
        createdAt: new Date("2018-06-22T21:42:38.869+0000"),
        description: "Show your penchant for the wild and free. The world is your oyster.",
        isBackorder: false,
        isDeleted: false,
        isLowQuantity: false,
        isSoldOut: false,
        isVisible: true,
        pageTitle: "Destination Unknown.",
        price: {
          range: "35.99",
          min: 35.99,
          max: 35.99
        },
        shopId: "J8Bhq3uTtdgwZx3rz",
        supportedFulfillmentTypes: [
          "shipping"
        ],
        title: "Ticket to Anywhere T-Shirt",
        type: "product-simple",
        updatedAt: new Date("2018-09-20T19:27:52.665+0000"),
        vendor: "Wanderlust, Inc.",
        workflow: {
          status: "new"
        },
        template: "productDetailSimple",
        ancestors: [

        ]
      },
      shippingMethod: {
        _id: "jWXqro78KkztEWZ7j",
        itemIds: [
          "zY9RxcqdgLvJ3zYRz",
          "2MBFE2JeKHmBMna9h"
        ],
        shopId: "J8Bhq3uTtdgwZx3rz",
        type: "shipping",
        shipmentQuotes: [
          {
            carrier: "Flat Rate",
            method: {
              name: "Free",
              label: "Free Shipping",
              group: "Ground",
              handling: 0,
              rate: 0,
              enabled: true,
              _id: "6MugCf3Pn5rpfNke2",
              carrier: "Flat Rate"
            },
            rate: 0,
            shopId: "J8Bhq3uTtdgwZx3rz"
          },
          {
            carrier: "Flat Rate",
            method: {
              name: "Standard",
              label: "Standard",
              group: "Ground",
              handling: 0,
              rate: 2.99,
              enabled: true,
              _id: "SPbMh5gdz24Wr4J94",
              carrier: "Flat Rate"
            },
            rate: 2.99,
            shopId: "J8Bhq3uTtdgwZx3rz"
          },
          {
            carrier: "Flat Rate",
            method: {
              name: "Priority",
              label: "Priority",
              group: "Priority",
              handling: 0,
              rate: 6.99,
              enabled: true,
              _id: "hmP2ePcxoTHnPxZmW",
              carrier: "Flat Rate"
            },
            rate: 6.99,
            shopId: "J8Bhq3uTtdgwZx3rz"
          }
        ],
        shipmentQuotesQueryStatus: {
          requestStatus: "success",
          numOfShippingMethodsFound: 3
        },
        address: {
          country: "US",
          fullName: "Some Guy",
          address1: "2110 Main Street",
          address2: "Suite 207",
          postal: "90405",
          city: "Santa Monica",
          region: "CA",
          phone: "5555555555",
          isShippingDefault: true,
          isBillingDefault: true,
          isCommercial: false,
          _id: "cBd5HcGDa9tFjPgdS",
          failedValidation: false
        },
        shipmentMethod: {
          name: "Standard",
          label: "Standard",
          group: "Ground",
          handling: 0,
          rate: 2.99,
          enabled: true,
          _id: "SPbMh5gdz24Wr4J94",
          carrier: "Flat Rate"
        },
        paymentId: "WdupGyFiowxb54s8S",
        workflow: {
          status: "new",
          workflow: [
            "coreOrderWorkflow/notStarted"
          ]
        }
      },
      variants: {
        _id: "L9w5FsbEuxiTcYPCT",
        createdAt: new Date("2018-09-20T19:27:53.110+0000"),
        height: 10,
        index: 0,
        inventoryManagement: true,
        inventoryPolicy: true,
        isLowQuantity: false,
        isSoldOut: false,
        length: 1,
        lowInventoryWarningThreshold: 0,
        optionTitle: "Large",
        price: 35.99,
        shopId: "J8Bhq3uTtdgwZx3rz",
        taxCode: "0000",
        title: "Large",
        updatedAt: new Date("2018-09-20T19:27:53.110+0000"),
        weight: 10,
        width: 10,
        ancestors: [

        ],
        isVisible: false,
        isDeleted: false,
        compareAtPrice: 0,
        inventoryQuantity: 0,
        type: "variant",
        taxable: true,
        workflow: {
          status: "new"
        }
      },
      workflow: {
        status: "new",
        workflow: [
          "coreOrderWorkflow/created"
        ]
      }
    },
    {
      _id: "2MBFE2JeKHmBMna9h",
      attributes: [
        {
          label: null,
          value: "Gold Band w/ Black Face"
        }
      ],
      isTaxable: false,
      optionTitle: "Untitled Option - copy",
      parcel: {
        weight: 2,
        height: 2,
        width: 2,
        length: 2
      },
      priceWhenAdded: {
        amount: 699.99,
        currencyCode: "USD"
      },
      productId: "ar2n4c6qthsidHHoi",
      productSlug: "curren-three-dial-watch",
      productVendor: "Curren",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Curren Three-dial Watch",
      updatedAt: new Date("2018-09-20T19:31:03.143+0000"),
      variantId: "tDyeLgiKEfKzAJnRn",
      variantTitle: "Gold Band w/ Black Face",
      addedAt: new Date("2018-09-20T19:31:03.143+0000"),
      createdAt: new Date("2018-09-20T19:31:03.143+0000"),
      taxRate: 0,
      product: {
        _id: "ar2n4c6qthsidHHoi",
        createdAt: new Date("2018-06-24T23:28:06.356+0000"),
        description: "Always show up on time with this classic three-dial watch from Curren.",
        isBackorder: false,
        isDeleted: false,
        isLowQuantity: false,
        isSoldOut: false,
        isVisible: true,
        pageTitle: "Timed Style.",
        price: {
          range: "599.99 - 699.99",
          min: 599.99,
          max: 699.99
        },
        shopId: "J8Bhq3uTtdgwZx3rz",
        supportedFulfillmentTypes: [
          "shipping"
        ],
        title: "Curren Three-dial Watch",
        type: "product-simple",
        updatedAt: new Date("2018-09-20T19:27:52.797+0000"),
        vendor: "Curren",
        workflow: {
          status: "new"
        },
        template: "productDetailSimple",
        ancestors: [

        ]
      },
      shippingMethod: {
        _id: "jWXqro78KkztEWZ7j",
        itemIds: [
          "zY9RxcqdgLvJ3zYRz",
          "2MBFE2JeKHmBMna9h"
        ],
        shopId: "J8Bhq3uTtdgwZx3rz",
        type: "shipping",
        shipmentQuotes: [
          {
            carrier: "Flat Rate",
            method: {
              name: "Free",
              label: "Free Shipping",
              group: "Ground",
              handling: 0,
              rate: 0,
              enabled: true,
              _id: "6MugCf3Pn5rpfNke2",
              carrier: "Flat Rate"
            },
            rate: 0,
            shopId: "J8Bhq3uTtdgwZx3rz"
          },
          {
            carrier: "Flat Rate",
            method: {
              name: "Standard",
              label: "Standard",
              group: "Ground",
              handling: 0,
              rate: 2.99,
              enabled: true,
              _id: "SPbMh5gdz24Wr4J94",
              carrier: "Flat Rate"
            },
            rate: 2.99,
            shopId: "J8Bhq3uTtdgwZx3rz"
          },
          {
            carrier: "Flat Rate",
            method: {
              name: "Priority",
              label: "Priority",
              group: "Priority",
              handling: 0,
              rate: 6.99,
              enabled: true,
              _id: "hmP2ePcxoTHnPxZmW",
              carrier: "Flat Rate"
            },
            rate: 6.99,
            shopId: "J8Bhq3uTtdgwZx3rz"
          }
        ],
        shipmentQuotesQueryStatus: {
          requestStatus: "success",
          numOfShippingMethodsFound: 3
        },
        address: {
          country: "US",
          fullName: "Some Guy",
          address1: "2110 Main Street",
          address2: "Suite 207",
          postal: "90405",
          city: "Santa Monica",
          region: "CA",
          phone: "5555555555",
          isShippingDefault: true,
          isBillingDefault: true,
          isCommercial: false,
          _id: "cBd5HcGDa9tFjPgdS",
          failedValidation: false
        },
        shipmentMethod: {
          name: "Standard",
          label: "Standard",
          group: "Ground",
          handling: 0,
          rate: 2.99,
          enabled: true,
          _id: "SPbMh5gdz24Wr4J94",
          carrier: "Flat Rate"
        },
        paymentId: "WdupGyFiowxb54s8S",
        workflow: {
          status: "new",
          workflow: [
            "coreOrderWorkflow/notStarted"
          ]
        }
      },
      variants: {
        _id: "tDyeLgiKEfKzAJnRn",
        createdAt: new Date("2018-09-20T19:27:53.621+0000"),
        height: 2,
        index: 0,
        inventoryManagement: true,
        inventoryPolicy: false,
        isLowQuantity: false,
        isSoldOut: false,
        length: 2,
        lowInventoryWarningThreshold: 0,
        optionTitle: "Untitled Option - copy",
        originCountry: "US",
        price: 699.99,
        shopId: "J8Bhq3uTtdgwZx3rz",
        taxCode: "0000",
        title: "Gold Band w/ Black Face",
        updatedAt: new Date("2018-09-20T19:27:53.621+0000"),
        weight: 2,
        width: 2,
        ancestors: [

        ],
        isVisible: false,
        isDeleted: false,
        compareAtPrice: 0,
        inventoryQuantity: 0,
        type: "variant",
        taxable: true,
        workflow: {
          status: "new"
        }
      },
      workflow: {
        status: "new",
        workflow: [
          "coreOrderWorkflow/created"
        ]
      }
    }
  ],
  shopId: "J8Bhq3uTtdgwZx3rz",
  updatedAt: new Date("2018-09-20T20:25:37.253+0000"),
  workflow: {
    status: "new",
    workflow: [
      "coreOrderWorkflow/created"
    ]
  },
  shipping: [
    {
      _id: "jWXqro78KkztEWZ7j",
      itemIds: [
        "zY9RxcqdgLvJ3zYRz",
        "2MBFE2JeKHmBMna9h"
      ],
      shopId: "J8Bhq3uTtdgwZx3rz",
      type: "shipping",
      shipmentQuotes: [
        {
          carrier: "Flat Rate",
          method: {
            name: "Free",
            label: "Free Shipping",
            group: "Ground",
            handling: 0,
            rate: 0,
            enabled: true,
            _id: "6MugCf3Pn5rpfNke2",
            carrier: "Flat Rate"
          },
          rate: 0,
          shopId: "J8Bhq3uTtdgwZx3rz"
        },
        {
          carrier: "Flat Rate",
          method: {
            name: "Standard",
            label: "Standard",
            group: "Ground",
            handling: 0,
            rate: 2.99,
            enabled: true,
            _id: "SPbMh5gdz24Wr4J94",
            carrier: "Flat Rate"
          },
          rate: 2.99,
          shopId: "J8Bhq3uTtdgwZx3rz"
        },
        {
          carrier: "Flat Rate",
          method: {
            name: "Priority",
            label: "Priority",
            group: "Priority",
            handling: 0,
            rate: 6.99,
            enabled: true,
            _id: "hmP2ePcxoTHnPxZmW",
            carrier: "Flat Rate"
          },
          rate: 6.99,
          shopId: "J8Bhq3uTtdgwZx3rz"
        }
      ],
      shipmentQuotesQueryStatus: {
        requestStatus: "success",
        numOfShippingMethodsFound: 3
      },
      address: {
        country: "US",
        fullName: "Some Guy",
        address1: "2110 Main Street",
        address2: "Suite 207",
        postal: "90405",
        city: "Santa Monica",
        region: "CA",
        phone: "5555555555",
        isShippingDefault: true,
        isBillingDefault: true,
        isCommercial: false,
        _id: "cBd5HcGDa9tFjPgdS",
        failedValidation: false
      },
      shipmentMethod: {
        name: "Standard",
        label: "Standard",
        group: "Ground",
        handling: 0,
        rate: 2.99,
        enabled: true,
        _id: "SPbMh5gdz24Wr4J94",
        carrier: "Flat Rate"
      },
      paymentId: "WdupGyFiowxb54s8S",
      workflow: {
        status: "new",
        workflow: [
          "coreOrderWorkflow/notStarted"
        ]
      }
    }
  ],
  discount: 0,
  tax: 0,
  taxRatesByShop: {
    J8Bhq3uTtdgwZx3rz: 0.06
  },
  cartId: "Z7cWgoi8DGC3buZ9r",
  email: "admin@localhost",
  bypassAddressValidation: false
};

const afterOrder = {
  _id: "pLtmCazjBSy5F9uuu",
  accountId: "NGn6GR8L7DfWnfGCh",
  currencyCode: "USD",
  createdAt: new Date("2018-09-20T20:25:37.253+0000"),
  shopId: "J8Bhq3uTtdgwZx3rz",
  updatedAt: new Date("2018-09-20T20:25:37.253+0000"),
  workflow: {
    status: "new",
    workflow: [
      "coreOrderWorkflow/created"
    ]
  },
  shipping: [
    {
      _id: "jWXqro78KkztEWZ7j",
      itemIds: [
        "zY9RxcqdgLvJ3zYRz",
        "2MBFE2JeKHmBMna9h"
      ],
      shopId: "J8Bhq3uTtdgwZx3rz",
      type: "shipping",
      address: {
        country: "US",
        fullName: "Some Guy",
        address1: "2110 Main Street",
        address2: "Suite 207",
        postal: "90405",
        city: "Santa Monica",
        region: "CA",
        phone: "5555555555",
        isShippingDefault: true,
        isBillingDefault: true,
        isCommercial: false,
        _id: "cBd5HcGDa9tFjPgdS",
        failedValidation: false
      },
      shipmentMethod: {
        name: "Standard",
        label: "Standard",
        group: "Ground",
        handling: 0,
        rate: 2.99,
        _id: "SPbMh5gdz24Wr4J94",
        carrier: "Flat Rate",
        currencyCode: "USD"
      },
      workflow: {
        status: "new",
        workflow: [
          "coreOrderWorkflow/notStarted"
        ]
      },
      items: [
        {
          _id: "zY9RxcqdgLvJ3zYRz",
          isTaxable: false,
          optionTitle: "Large",
          attributes: [
            {
              label: null,
              value: "Ticket to Anywhere"
            },
            {
              label: null,
              value: "Large"
            }
          ],
          parcel: {
            weight: 10,
            height: 10,
            width: 10,
            length: 1
          },
          productId: "FjcfCt6qBBxLskWDn",
          productSlug: "ticket-to-anywhere-t-shirt",
          productVendor: "Wanderlust, Inc.",
          productType: "product-simple",
          quantity: 1,
          shopId: "J8Bhq3uTtdgwZx3rz",
          taxCode: "0000",
          title: "Ticket to Anywhere T-Shirt",
          updatedAt: new Date("2018-09-20T19:30:53.025+0000"),
          variantId: "L9w5FsbEuxiTcYPCT",
          variantTitle: "Large",
          addedAt: new Date("2018-09-20T19:30:53.025+0000"),
          createdAt: new Date("2018-09-20T19:30:53.025+0000"),
          taxRate: 0,
          workflow: {
            status: "new",
            workflow: [
              "coreOrderWorkflow/created"
            ]
          },
          price: {
            amount: 35.99,
            currencyCode: "USD"
          },
          subtotal: 35.99,
          tax: 0
        },
        {
          _id: "2MBFE2JeKHmBMna9h",
          isTaxable: false,
          optionTitle: "Untitled Option - copy",
          attributes: [
            {
              label: null,
              value: "Gold Band w/ Black Face"
            }
          ],
          parcel: {
            weight: 2,
            height: 2,
            width: 2,
            length: 2
          },
          productId: "ar2n4c6qthsidHHoi",
          productSlug: "curren-three-dial-watch",
          productVendor: "Curren",
          productType: "product-simple",
          quantity: 1,
          shopId: "J8Bhq3uTtdgwZx3rz",
          taxCode: "0000",
          title: "Curren Three-dial Watch",
          updatedAt: new Date("2018-09-20T19:31:03.143+0000"),
          variantId: "tDyeLgiKEfKzAJnRn",
          variantTitle: "Gold Band w/ Black Face",
          addedAt: new Date("2018-09-20T19:31:03.143+0000"),
          createdAt: new Date("2018-09-20T19:31:03.143+0000"),
          taxRate: 0,
          workflow: {
            status: "new",
            workflow: [
              "coreOrderWorkflow/created"
            ]
          },
          price: {
            amount: 699.99,
            currencyCode: "USD"
          },
          subtotal: 699.99,
          tax: 0
        }
      ],
      totalItemQuantity: 2,
      payment: {
        _id: "WdupGyFiowxb54s8S",
        address: {
          country: "US",
          fullName: "Some Guy",
          address1: "2110 Main Street",
          address2: "Suite 207",
          postal: "90405",
          city: "Santa Monica",
          region: "CA",
          phone: "5555555555",
          isShippingDefault: true,
          isBillingDefault: true,
          isCommercial: false,
          _id: "u7HFEFBKhhGkGMPcB",
          failedValidation: false
        },
        amount: 738.97,
        createdAt: jasmine.any(Date),
        currency: {
          userCurrency: "USD",
          exchangeRate: 1
        },
        currencyCode: "USD",
        data: {
          billingAddress: {
            country: "US",
            fullName: "Some Guy",
            address1: "2110 Main Street",
            address2: "Suite 207",
            postal: "90405",
            city: "Santa Monica",
            region: "CA",
            phone: "5555555555",
            isShippingDefault: true,
            isBillingDefault: true,
            isCommercial: false,
            _id: "u7HFEFBKhhGkGMPcB",
            failedValidation: false
          },
          chargeId: "ur4eYdBoQQffQoquE"
        },
        displayName: "Visa 1111",
        invoice: {
          shipping: 2.99,
          subtotal: 735.98,
          taxes: 0,
          discounts: 0,
          total: 738.97,
          effectiveTaxRate: 0
        },
        method: "credit",
        mode: "authorize",
        name: "iou_example",
        paymentPluginName: "example-paymentmethod",
        processor: "Example",
        riskLevel: "normal",
        shopId: "J8Bhq3uTtdgwZx3rz",
        status: "created",
        transactionId: "ur4eYdBoQQffQoquE",
        transactions: [
          {
            amount: 738.97,
            transactionId: "ur4eYdBoQQffQoquE",
            currency: "USD"
          }
        ]
      },
      invoice: {
        shipping: 2.99,
        subtotal: 735.98,
        taxes: 0,
        discounts: 0,
        total: 738.97,
        effectiveTaxRate: 0
      }
    }
  ],
  tax: 0,
  cartId: "Z7cWgoi8DGC3buZ9r",
  email: "admin@localhost",
  bypassAddressValidation: false,
  discounts: [],
  totalItemQuantity: 2
};

const packages = [
  {
    _id: "euAJq7W8MzPJPm7Ne",
    name: "example-paymentmethod"
  },
  {
    _id: "z67os7RfrJ4D8Z9HW",
    name: "reaction-stripe"
  }
];

test("converts an order correctly", () => {
  const doc = convertOrder(beforeOrder, packages);
  expect(doc).toEqual(afterOrder);
});

import convertCatalogItem from "./convertCatalogItem";

const beforeDoc = {
  _id: "BCTMZ6HTxFSppJESk",
  title: "Basic Reaction Product",
  shopId: "J8Bhq3uTtdgwZx3rz",
  ancestors: [],
  description: "DESCRIPTION",
  productType: "productType",
  hashtags: [
    "rpjCvTBGjhBi2xdro",
    "cseCBSSrJ3t8HQSNP"
  ],
  price: {
    range: "12.99 - 19.99",
    min: 12.99,
    max: 19.99
  },
  isVisible: true,
  isLowQuantity: false,
  isSoldOut: false,
  isBackorder: false,
  metafields: [
    {
      key: "Material",
      value: "Cotton"
    },
    {
      key: "Quality",
      value: "Excellent"
    }
  ],
  pageTitle: "This is a basic product. You can do a lot with it.",
  type: "product-simple",
  updatedAt: new Date("2018-05-24T14:43:26.282+0000"),
  vendor: "Example Manufacturer",
  originCountry: "US",
  supportedFulfillmentTypes: ["shipping"],
  handle: "example-product",
  isDeleted: false,
  template: "productDetailSimple",
  createdAt: new Date("2018-05-24T14:43:26.282+0000"),
  workflow: {
    status: "new"
  },
  height: 27.4,
  length: 765.6,
  weight: 1.23,
  width: 7.68,
  barcode: "barcode1",
  sku: "PROD_SKU",
  parcel: "PARCEL",
  positions: {
    "some shop": {
      position: 1,
      pinned: false,
      weight: 2,
      updatedAt: new Date("2018-05-26T14:43:26.282+0000")
    },
    "some-tag-slug": {
      position: 2,
      pinned: true,
      weight: 1,
      updatedAt: new Date("2018-05-26T15:43:26.282+0000")
    }
  },
  lowInventoryWarningThreshold: 2,
  metaDescription: "metaDescription",
  media: [
    {
      metadata: {
        priority: 2,
        toGrid: 1,
        productId: "BCTMZ6HTxFSppJESk",
        variantId: "BCTMZ6HTxFSppJESk"
      },
      thumbnail: "p2-thumbnail.jpg",
      small: "p2-small.jpg",
      medium: "p2-medium.jpg",
      large: "p2-large.jpg",
      image: "p2-image.jpg"
    },
    {
      metadata: {
        priority: 1,
        toGrid: 1,
        productId: "BCTMZ6HTxFSppJESk",
        variantId: "BCTMZ6HTxFSppJESk"
      },
      thumbnail: "p1-thumbnail.jpg",
      small: "p1-small.jpg",
      medium: "p1-medium.jpg",
      large: "p1-large.jpg",
      image: "p1-image.jpg"
    }
  ],
  minOrderQuantity: 1,
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  twitterMsg: "twitterMsg",
  facebookMsg: "facebookMsg",
  googleplusMsg: "googleplusMsg",
  pinterestMsg: "pinterestMsg",
  variants: [
    {
      _id: "6qiqPwBkeJdtdQc4G",
      title: "Basic Example Variant",
      ancestors: [
        "BCTMZ6HTxFSppJESk"
      ],
      price: 19.99,
      inventoryManagement: true,
      inventoryPolicy: true,
      isVisible: true,
      updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
      createdAt: new Date("2014-04-03T20:46:52.411+0000"),
      weight: 35,
      barcode: "barcode2",
      metafields: [
        {
          key: null,
          value: null
        }
      ],
      minOrderQuantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxable: true,
      type: "variant",
      originCountry: "US",
      isDeleted: false,
      compareAtPrice: 0,
      length: 0,
      width: 0,
      height: 0,
      lowInventoryWarningThreshold: 0,
      sku: "SKU",
      taxCode: "0000",
      taxDescription: "taxDescription",
      optionTitle: "Untitled Option",
      workflow: {
        status: "new"
      }
    },
    {
      _id: "SMr4rhDFnYvFMtDTX",
      title: "Option 1 - Red Dwarf",
      ancestors: [
        "BCTMZ6HTxFSppJESk",
        "6qiqPwBkeJdtdQc4G"
      ],
      optionTitle: "Red",
      price: 19.99,
      inventoryManagement: true,
      inventoryPolicy: true,
      isVisible: true,
      updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
      createdAt: new Date("2014-04-03T20:46:52.411+0000"),
      weight: 25,
      length: 10,
      height: 3,
      width: 10,
      barcode: "barcode3",
      metafields: [
        {
          key: null,
          value: null
        }
      ],
      minOrderQuantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxable: true,
      type: "variant",
      originCountry: "US",
      isDeleted: false,
      compareAtPrice: 0,
      lowInventoryWarningThreshold: 0,
      sku: "SKU",
      taxCode: "0000",
      taxDescription: "taxDescription",
      workflow: {
        status: "new"
      }
    },
    {
      _id: "CJoRBm9vRrorc9mxZ",
      title: "Option 2 - Green Tomato",
      ancestors: [
        "BCTMZ6HTxFSppJESk",
        "6qiqPwBkeJdtdQc4G"
      ],
      optionTitle: "Green",
      price: 12.99,
      inventoryManagement: true,
      inventoryPolicy: true,
      isVisible: true,
      updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
      createdAt: new Date("2014-04-03T20:46:52.411+0000"),
      weight: 25,
      length: 10,
      height: 3,
      width: 10,
      barcode: "barcode4",
      metafields: [
        {
          key: null,
          value: null
        }
      ],
      minOrderQuantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxable: true,
      type: "variant",
      originCountry: "US",
      isDeleted: false,
      compareAtPrice: 0,
      lowInventoryWarningThreshold: 0,
      sku: "SKU",
      taxCode: "0000",
      taxDescription: "taxDescription",
      workflow: {
        status: "new"
      }
    }
  ]
};

const afterDoc = {
  _id: "BCTMZ6HTxFSppJESk",
  product: {
    _id: "BCTMZ6HTxFSppJESk",
    barcode: "barcode1",
    createdAt: new Date("2018-05-24T14:43:26.282+0000"),
    description: "DESCRIPTION",
    isBackorder: false,
    isDeleted: false,
    isLowQuantity: false,
    isSoldOut: false,
    isTaxable: false,
    isVisible: true,
    height: 27.4,
    length: 765.6,
    lowInventoryWarningThreshold: 2,
    minOrderQuantity: 1,
    media: [
      {
        priority: 1,
        toGrid: 1,
        productId: "BCTMZ6HTxFSppJESk",
        variantId: "BCTMZ6HTxFSppJESk",
        URLs: {
          thumbnail: "p1-thumbnail.jpg",
          small: "p1-small.jpg",
          medium: "p1-medium.jpg",
          large: "p1-large.jpg",
          original: "p1-image.jpg"
        }
      },
      {
        priority: 2,
        toGrid: 1,
        productId: "BCTMZ6HTxFSppJESk",
        variantId: "BCTMZ6HTxFSppJESk",
        URLs: {
          thumbnail: "p2-thumbnail.jpg",
          small: "p2-small.jpg",
          medium: "p2-medium.jpg",
          large: "p2-large.jpg",
          original: "p2-image.jpg"
        }
      }
    ],
    metaDescription: "metaDescription",
    metafields: [
      {
        key: "Material",
        value: "Cotton"
      },
      {
        key: "Quality",
        value: "Excellent"
      }
    ],
    originCountry: "US",
    pageTitle: "This is a basic product. You can do a lot with it.",
    parcel: "PARCEL",
    positions: {
      _default: {
        position: 1,
        pinned: false,
        weight: 2,
        updatedAt: new Date("2018-05-26T14:43:26.282+0000")
      },
      rpjCvTBGjhBi2xdro: {
        position: 2,
        pinned: true,
        weight: 1,
        updatedAt: new Date("2018-05-26T15:43:26.282+0000")
      }
    },
    price: {
      range: "12.99 - 19.99",
      min: 12.99,
      max: 19.99
    },
    pricing: {
      USD: {
        compareAtPrice: null,
        displayPrice: "$12.99 - $19.99",
        maxPrice: 19.99,
        minPrice: 12.99,
        price: null
      }
    },
    primaryImage: {
      priority: 1,
      toGrid: 1,
      productId: "BCTMZ6HTxFSppJESk",
      variantId: "BCTMZ6HTxFSppJESk",
      URLs: {
        thumbnail: "p1-thumbnail.jpg",
        small: "p1-small.jpg",
        medium: "p1-medium.jpg",
        large: "p1-large.jpg",
        original: "p1-image.jpg"
      }
    },
    productId: "BCTMZ6HTxFSppJESk",
    productType: "productType",
    shopId: "J8Bhq3uTtdgwZx3rz",
    sku: "PROD_SKU",
    slug: "example-product",
    socialMetadata: [
      {
        message: "twitterMsg",
        service: "twitter"
      },
      {
        message: "facebookMsg",
        service: "facebook"
      },
      {
        message: "googleplusMsg",
        service: "googleplus"
      },
      {
        message: "pinterestMsg",
        service: "pinterest"
      }
    ],
    supportedFulfillmentTypes: ["shipping"],
    tagIds: [
      "rpjCvTBGjhBi2xdro",
      "cseCBSSrJ3t8HQSNP"
    ],
    taxCode: "taxCode",
    taxDescription: "taxDescription",
    title: "Basic Reaction Product",
    type: "product-simple",
    updatedAt: new Date("2018-05-24T14:43:26.282+0000"),
    variants: [
      {
        _id: "6qiqPwBkeJdtdQc4G",
        barcode: "barcode2",
        createdAt: new Date("2014-04-03T20:46:52.411+0000"),
        height: 0,
        index: 0,
        inventoryManagement: true,
        inventoryPolicy: true,
        isLowQuantity: false,
        isSoldOut: false,
        isTaxable: true,
        length: 0,
        lowInventoryWarningThreshold: 0,
        metafields: [
          {
            key: null,
            value: null
          }
        ],
        minOrderQuantity: 1,
        optionTitle: "Untitled Option",
        originCountry: "US",
        price: 19.99,
        pricing: {
          USD: {
            compareAtPrice: null,
            displayPrice: "$12.99 - $19.99",
            maxPrice: 19.99,
            minPrice: 12.99,
            price: 19.99
          }
        },
        shopId: "J8Bhq3uTtdgwZx3rz",
        sku: "SKU",
        taxCode: "0000",
        taxDescription: "taxDescription",
        title: "Basic Example Variant",
        updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
        variantId: "6qiqPwBkeJdtdQc4G",
        weight: 35,
        width: 0,
        options: [
          {
            _id: "SMr4rhDFnYvFMtDTX",
            barcode: "barcode3",
            createdAt: new Date("2014-04-03T20:46:52.411+0000"),
            height: 3,
            index: 0,
            inventoryManagement: true,
            inventoryPolicy: true,
            isLowQuantity: false,
            isSoldOut: false,
            isTaxable: true,
            length: 10,
            lowInventoryWarningThreshold: 0,
            metafields: [
              {
                key: null,
                value: null
              }
            ],
            minOrderQuantity: 1,
            optionTitle: "Red",
            originCountry: "US",
            price: 19.99,
            pricing: {
              USD: {
                compareAtPrice: null,
                displayPrice: "$19.99",
                maxPrice: 19.99,
                minPrice: 19.99,
                price: 19.99
              }
            },
            shopId: "J8Bhq3uTtdgwZx3rz",
            sku: "SKU",
            taxCode: "0000",
            taxDescription: "taxDescription",
            title: "Option 1 - Red Dwarf",
            updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
            variantId: "SMr4rhDFnYvFMtDTX",
            weight: 25,
            width: 10
          },
          {
            _id: "CJoRBm9vRrorc9mxZ",
            barcode: "barcode4",
            createdAt: new Date("2014-04-03T20:46:52.411+0000"),
            height: 3,
            index: 0,
            inventoryManagement: true,
            inventoryPolicy: true,
            isLowQuantity: false,
            isSoldOut: false,
            isTaxable: true,
            length: 10,
            lowInventoryWarningThreshold: 0,
            metafields: [
              {
                key: null,
                value: null
              }
            ],
            minOrderQuantity: 1,
            optionTitle: "Green",
            originCountry: "US",
            price: 12.99,
            pricing: {
              USD: {
                compareAtPrice: null,
                displayPrice: "$12.99",
                maxPrice: 12.99,
                minPrice: 12.99,
                price: 12.99
              }
            },
            shopId: "J8Bhq3uTtdgwZx3rz",
            sku: "SKU",
            taxCode: "0000",
            taxDescription: "taxDescription",
            title: "Option 2 - Green Tomato",
            updatedAt: new Date("2014-04-03T20:46:52.411+0000"),
            variantId: "CJoRBm9vRrorc9mxZ",
            weight: 25,
            width: 10
          }
        ]
      }
    ],
    vendor: "Example Manufacturer",
    weight: 1.23,
    width: 7.68
  },
  shopId: "J8Bhq3uTtdgwZx3rz",
  updatedAt: jasmine.anything(),
  createdAt: new Date("2018-05-24T14:43:26.282+0000")
};

test("returns correctly converted doc", () => {
  const shop = {
    currency: "USD",
    currencies: {
      USD: {
        enabled: true,
        format: "%s%v",
        symbol: "$"
      }
    }
  };

  const tags = [
    {
      _id: "rpjCvTBGjhBi2xdro",
      slug: "some-tag-slug"
    }
  ];

  const doc = convertCatalogItem(beforeDoc, shop, tags);
  expect(doc).toEqual(afterDoc);
});

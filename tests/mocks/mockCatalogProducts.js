import { internalShopId, opaqueShopId } from "./mockShop";
import { internalTagIds, opaqueTagIds } from "./mockTags";

/**
 *
 * @todo TEMP mocks these will be removed in favor of a fixture/factory solution
 */

export const internalProductIds = ["999", "222"];
export const opaqueProductIds = ["cmVhY3Rpb24vcHJvZHVjdDo5OTk=", "cmVhY3Rpb24vcHJvZHVjdDoyMjI="]; // reaction/product

export const internalVariantIds = ["875", "874", "873"];
export const opaqueVariantIds = [
  "cmVhY3Rpb24vcHJvZHVjdDo4NzU=",
  "cmVhY3Rpb24vcHJvZHVjdDo4NzQ=",
  "cmVhY3Rpb24vcHJvZHVjdDo4NzM="
]; // reaction/product

export const internalCatalogProductIds = ["999", "222"];
export const opaqueCatalogProductIds = ["cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6OTk5", "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6MjIy"]; // reaction/catalogProduct

export const opaqueCatalogVariantIds = [
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NQ==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NA==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3Mw=="
]; // reaction/catalogProductVariant

export const internalCatalogItemIds = ["999", "222"];
export const opaqueCatalogItemIds = ["cmVhY3Rpb24vY2F0YWxvZ0l0ZW06OTk5", "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06MjIy"]; // reaction/catalogItem

export const createdAt = new Date("2018-04-16T15:34:28.043Z");
export const updatedAt = new Date("2018-04-17T15:34:28.043Z");

/**
 * mock internal catalog product variant options
 */
export const mockInternalCatalogOptions = [
  {
    _id: internalVariantIds[1],
    barcode: "barcode",
    createdAt: null,
    height: 2,
    index: 0,
    isTaxable: true,
    length: 2,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Awesome Soft Bike",
    originCountry: "US",
    pricing: {
      USD: {
        compareAtPrice: null,
        displayPrice: "5.99",
        maxPrice: 5.99,
        minPrice: 5.99,
        price: 5.99
      }
    },
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Two pound bag",
    updatedAt: null,
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  },
  {
    _id: internalVariantIds[2],
    barcode: "barcode",
    createdAt: null,
    height: 2,
    index: 0,
    isTaxable: true,
    length: 2,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Another Awesome Soft Bike",
    originCountry: "US",
    pricing: {
      USD: {
        compareAtPrice: null,
        displayPrice: "2.99",
        maxPrice: 2.99,
        minPrice: 2.99,
        price: 2.99
      }
    },
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt: null,
    variantId: internalVariantIds[2],
    weight: 2,
    width: 2
  }
];

/**
 * mock external catalog product variant options
 */
export const mockExternalCatalogOptions = [
  {
    _id: opaqueCatalogVariantIds[1],
    barcode: "barcode",
    createdAt: null,
    height: 2,
    index: 0,
    isLowQuantity: false,
    isSoldOut: false,
    isTaxable: true,
    length: 2,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Awesome Soft Bike",
    originCountry: "US",
    pricing: [
      {
        currency: {
          _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
          code: "USD"
        },
        compareAtPrice: null,
        displayPrice: "5.99",
        maxPrice: 5.99,
        minPrice: 5.99,
        price: 5.99
      }
    ],
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Two pound bag",
    updatedAt: null,
    variantId: opaqueVariantIds[1],
    weight: 2,
    width: 2
  },
  {
    _id: opaqueCatalogVariantIds[2],
    barcode: "barcode",
    createdAt: null,
    height: 2,
    index: 0,
    isLowQuantity: false,
    isSoldOut: false,
    isTaxable: true,
    length: 2,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Another Awesome Soft Bike",
    originCountry: "US",
    pricing: [
      {
        currency: {
          _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
          code: "USD"
        },
        compareAtPrice: null,
        displayPrice: "2.99",
        maxPrice: 2.99,
        minPrice: 2.99,
        price: 2.99
      }
    ],
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt: null,
    variantId: opaqueVariantIds[2],
    weight: 2,
    width: 2
  }
];

/**
 * mock internal catalog product variants
 */
export const mockInternalCatalogVariants = [
  {
    _id: internalVariantIds[0],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    height: 0,
    index: 0,
    isTaxable: true,
    length: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    options: mockInternalCatalogOptions,
    optionTitle: "Untitled Option",
    originCountry: "US",
    pricing: {
      USD: {
        compareAtPrice: 10,
        displayPrice: "2.99 - 5.99",
        maxPrice: 5.99,
        minPrice: 2.99,
        price: null
      }
    },
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt: updatedAt.toISOString(),
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  }
];

/**
 * mock external catalog product variants
 */
export const mockExternalCatalogVariants = [
  {
    _id: opaqueCatalogVariantIds[0],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    height: 0,
    index: 0,
    isLowQuantity: false,
    isSoldOut: true,
    isTaxable: true,
    length: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    options: mockExternalCatalogOptions,
    originCountry: "US",
    pricing: [
      {
        currency: {
          _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
          code: "USD"
        },
        compareAtPrice: { amount: 10 },
        displayPrice: "2.99 - 5.99",
        maxPrice: 5.99,
        minPrice: 2.99,
        price: null
      }
    ],
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt: updatedAt.toISOString(),
    variantId: opaqueVariantIds[0],
    weight: 0,
    width: 0
  }
];

/**
 * mock internal catalog products
 */
export const mockInternalCatalogProducts = [
  {
    _id: internalCatalogProductIds[0],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    description: "description",
    height: 11.23,
    isBackorder: false,
    isLowQuantity: false,
    isSoldOut: false,
    isVisible: true,
    length: 5.67,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    metaDescription: "metaDescription",
    minOrderQuantity: 5,
    originCountry: "originCountry",
    pageTitle: "pageTitle",
    parcel: {
      containers: "containers",
      length: 4.44,
      width: 5.55,
      height: 6.66,
      weight: 7.77
    },
    pricing: {
      USD: {
        compareAtPrice: 10,
        displayPrice: "2.99 - 5.99",
        maxPrice: 5.99,
        minPrice: 2.99,
        price: null
      }
    },
    productId: internalProductIds[0],
    media: [
      {
        priority: 1,
        productId: internalProductIds[0],
        variantId: null,
        URLs: {
          thumbnail: "/thumbnail",
          small: "/small",
          medium: "/medium",
          large: "/large",
          original: "/original"
        }
      }
    ],
    primaryImage: {
      priority: 1,
      productId: internalProductIds[0],
      variantId: null,
      URLs: {
        thumbnail: "/thumbnail",
        small: "/small",
        medium: "/medium",
        large: "/large",
        original: "/original"
      }
    },
    productType: "productType",
    shopId: internalShopId,
    sku: "ABC123",
    slug: "fake-product",
    socialMetadata: [
      { service: "twitter", message: "twitterMessage" },
      { service: "facebook", message: "facebookMessage" },
      { service: "googleplus", message: "googlePlusMessage" },
      { service: "pinterest", message: "pinterestMessage" }
    ],
    supportedFulfillmentTypes: ["shipping"],
    tagIds: internalTagIds,
    title: "Fake Product Title",
    type: "product-simple",
    updatedAt: updatedAt.toISOString(),
    variants: mockInternalCatalogVariants,
    vendor: "vendor",
    weight: 15.6,
    width: 8.4
  },
  {
    _id: internalCatalogProductIds[1],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    description: "description",
    height: 11.23,
    isBackorder: false,
    isLowQuantity: false,
    isSoldOut: false,
    isVisible: true,
    length: 5.67,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    metaDescription: "metaDescription",
    minOrderQuantity: 5,
    originCountry: "originCountry",
    pageTitle: "pageTitle",
    parcel: {
      containers: "containers",
      length: 4.44,
      width: 5.55,
      height: 6.66,
      weight: 7.77
    },
    pricing: {
      USD: {
        compareAtPrice: 35,
        displayPrice: "16.99 - 25.99",
        maxPrice: 25.99,
        minPrice: 16.99,
        price: null
      }
    },
    productId: internalProductIds[1],
    media: [
      {
        priority: 1,
        productId: internalProductIds[1],
        variantId: null,
        URLs: {
          thumbnail: "/thumbnail",
          small: "/small",
          medium: "/medium",
          large: "/large",
          original: "/original"
        }
      }
    ],
    primaryImage: {
      priority: 1,
      productId: internalProductIds[1],
      variantId: null,
      URLs: {
        thumbnail: "/thumbnail",
        small: "/small",
        medium: "/medium",
        large: "/large",
        original: "/original"
      }
    },
    productType: "productType",
    shopId: internalShopId,
    sku: "ABC123",
    slug: "another-fake-product",
    socialMetadata: [
      { service: "twitter", message: "twitterMessage" },
      { service: "facebook", message: "facebookMessage" },
      { service: "googleplus", message: "googlePlusMessage" },
      { service: "pinterest", message: "pinterestMessage" }
    ],
    supportedFulfillmentTypes: ["shipping"],
    tagIds: internalTagIds,
    title: "Another Fake Product Title",
    type: "product-simple",
    updatedAt: updatedAt.toISOString(),
    variants: [],
    vendor: "another vendor",
    weight: 15.6,
    width: 8.4
  }
];

/**
 * mock external catalog products
 */
export const mockExternalCatalogProducts = [
  {
    _id: opaqueCatalogItemIds[0],
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    shop: {
      _id: opaqueShopId
    },
    product: {
      _id: opaqueCatalogProductIds[0],
      barcode: "barcode",
      createdAt: createdAt.toISOString(),
      description: "description",
      height: 11.23,
      isBackorder: false,
      isLowQuantity: false,
      isSoldOut: false,
      length: 5.67,
      metafields: [
        {
          value: "value",
          namespace: "namespace",
          description: "description",
          valueType: "valueType",
          scope: "scope",
          key: "key"
        }
      ],
      metaDescription: "metaDescription",
      minOrderQuantity: 5,
      originCountry: "originCountry",
      pageTitle: "pageTitle",
      parcel: {
        containers: "containers",
        length: 4.44,
        width: 5.55,
        height: 6.66,
        weight: 7.77
      },
      pricing: [
        {
          currency: {
            _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
            code: "USD"
          },
          compareAtPrice: { amount: 10 },
          displayPrice: "2.99 - 5.99",
          maxPrice: 5.99,
          minPrice: 2.99,
          price: null
        }
      ],
      productId: opaqueProductIds[0],
      media: [
        {
          priority: 1,
          productId: opaqueProductIds[0],
          variantId: null,
          toGrid: 1,
          URLs: {
            thumbnail: "/thumbnail",
            small: "/small",
            medium: "/medium",
            large: "/large",
            original: "/original"
          }
        }
      ],
      primaryImage: {
        priority: 1,
        productId: opaqueProductIds[0],
        variantId: null,
        toGrid: 1,
        URLs: {
          thumbnail: "/thumbnail",
          small: "/small",
          medium: "/medium",
          large: "/large",
          original: "/original"
        }
      },
      productType: "productType",
      shop: {
        _id: opaqueShopId
      },
      sku: "ABC123",
      slug: "fake-product",
      socialMetadata: [
        { service: "twitter", message: "twitterMessage" },
        { service: "facebook", message: "facebookMessage" },
        { service: "googleplus", message: "googlePlusMessage" },
        { service: "pinterest", message: "pinterestMessage" }
      ],
      supportedFulfillmentTypes: ["shipping"],
      tagIds: opaqueTagIds,
      tags: {
        nodes: [{ _id: opaqueTagIds[0] }, { _id: opaqueTagIds[1] }]
      },
      title: "Fake Product Title",
      updatedAt: updatedAt.toISOString(),
      variants: mockExternalCatalogVariants,
      vendor: "vendor",
      weight: 15.6,
      width: 8.4
    }
  },
  {
    _id: opaqueCatalogItemIds[1],
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    shop: {
      _id: opaqueShopId
    },
    product: {
      _id: opaqueCatalogProductIds[1],
      barcode: "barcode",
      createdAt: createdAt.toISOString(),
      description: "description",
      height: 11.23,
      isBackorder: false,
      isLowQuantity: false,
      isSoldOut: false,
      length: 5.67,
      metafields: [
        {
          value: "value",
          namespace: "namespace",
          description: "description",
          valueType: "valueType",
          scope: "scope",
          key: "key"
        }
      ],
      metaDescription: "metaDescription",
      minOrderQuantity: 5,
      originCountry: "originCountry",
      pageTitle: "pageTitle",
      parcel: {
        containers: "containers",
        length: 4.44,
        width: 5.55,
        height: 6.66,
        weight: 7.77
      },
      pricing: [
        {
          currency: {
            _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
            code: "USD"
          },
          compareAtPrice: { amount: 35 },
          displayPrice: "16.99 - 25.99",
          maxPrice: 25.99,
          minPrice: 16.99,
          price: null
        }
      ],
      productId: opaqueProductIds[1],
      media: [
        {
          priority: 1,
          productId: opaqueProductIds[1],
          variantId: null,
          toGrid: 1,
          URLs: {
            thumbnail: "/thumbnail",
            small: "/small",
            medium: "/medium",
            large: "/large",
            original: "/original"
          }
        }
      ],
      primaryImage: {
        priority: 1,
        productId: opaqueProductIds[1],
        variantId: null,
        toGrid: 1,
        URLs: {
          thumbnail: "/thumbnail",
          small: "/small",
          medium: "/medium",
          large: "/large",
          original: "/original"
        }
      },
      productType: "productType",
      shop: {
        _id: opaqueShopId
      },
      sku: "ABC123",
      slug: "another-fake-product",
      socialMetadata: [
        { service: "twitter", message: "twitterMessage" },
        { service: "facebook", message: "facebookMessage" },
        { service: "googleplus", message: "googlePlusMessage" },
        { service: "pinterest", message: "pinterestMessage" }
      ],
      supportedFulfillmentTypes: ["shipping"],
      tagIds: opaqueTagIds,
      tags: {
        nodes: [{ _id: opaqueTagIds[0] }, { _id: opaqueTagIds[1] }]
      },
      title: "Another Fake Product Title",
      updatedAt: updatedAt.toISOString(),
      variants: [],
      vendor: "another vendor",
      weight: 15.6,
      width: 8.4
    }
  }
];

import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { convertCatalogItemVariants } from "./convert48";

const mockCollections = { ...mockContext.collections };

const internalShopId = "123";
const internalCatalogItemId = "999";
const internalCatalogProductId = "999";
const internalVariantIds = ["875", "874"];

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

const mockVariants = [
  // This top-level variant should not be considered in the update of current catalog item
  // variants / options when updating inventory. It's not published (not in the catalog)
  // and there for cannot be considered, lest we unintentionally publish products
  // that are not yet ready to be published.
  {
    _id: "29805-not-publish-top-variant",
    ancestors: [internalCatalogProductId],
    barcode: "barcode",
    createdAt,
    compareAtPrice: 1100,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    inventoryQuantity: 100,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
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
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  // This variant-option should not be considered in the update of current catalog item
  // variants / options when updating inventory. It's not published (not in the catalog)
  // and there for cannot be considered, lest we unintentionally publish products
  // that are not yet ready to be published.
  {
    _id: "1234-not-yet-published",
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    barcode: "barcode",
    createdAt,
    height: 2,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: true,
    inventoryQuantity: 1000,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 2,
    lowInventoryWarningThreshold: 0,
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
    price: 992.0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt,
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  },
  // Variant SHOULD be used for the inventory update
  {
    _id: internalVariantIds[0],
    ancestors: [internalCatalogProductId],
    barcode: "barcode",
    createdAt,
    compareAtPrice: 1100,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    inventoryQuantity: 100,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
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
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  // Variant option SHOULD be used for the inventory update
  {
    _id: internalVariantIds[1],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    barcode: "barcode",
    createdAt,
    height: 2,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: true,
    inventoryQuantity: 0,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 2,
    lowInventoryWarningThreshold: 0,
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
    price: 992.0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt,
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

const mockCatalogProductBefore = {
  _id: "999",
  barcode: "barcode",
  createdAt,
  description: "description",
  height: 11.23,
  isBackorder: false,
  isDeleted: false,
  isLowQuantity: false,
  isSoldOut: true,
  isTaxable: false,
  isVisible: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
  media: [{
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  }],
  metaDescription: "metaDescription",
  metafields: [{
    description: "description",
    key: "key",
    namespace: "namespace",
    scope: "scope",
    value: "value",
    valueType: "valueType"
  }],
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    height: 6.66,
    length: 4.44,
    weight: 7.77,
    width: 5.55
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  pricing: {
    USD: {
      compareAtPrice: null,
      displayPrice: "$992.00",
      maxPrice: 992,
      minPrice: 992,
      price: null
    }
  },
  primaryImage: {
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  },
  productId: "999",
  productType: "productType",
  shopId: "123",
  sku: "ABC123",
  slug: "fake-product",
  socialMetadata: [{
    message: "twitterMessage",
    service: "twitter"
  }, {
    message: "facebookMessage",
    service: "facebook"
  }, {
    message: "googlePlusMessage",
    service: "googleplus"
  }, {
    message: "pinterestMessage",
    service: "pinterest"
  }],
  supportedFulfillmentTypes: ["shipping"],
  tagIds: ["923", "924"],
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  title: "Fake Product Title",
  type: "product-simple",
  updatedAt,
  variants: [{
    _id: "875",
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    inventoryQuantity: 100,
    isLowQuantity: false,
    isSoldOut: false,
    isTaxable: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    media: [],
    metafields: [{
      description: "description",
      key: "key",
      namespace: "namespace",
      scope: "scope",
      value: "value",
      valueType: "valueType"
    }],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    options: [{
      _id: "874",
      barcode: "barcode",
      createdAt,
      height: 2,
      index: 0,
      inventoryManagement: true,
      inventoryPolicy: true,
      inventoryQuantity: 0,
      isLowQuantity: false,
      isSoldOut: false,
      isTaxable: true,
      length: 2,
      lowInventoryWarningThreshold: 0,
      media: [{
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      }],
      metafields: [{
        description: "description",
        key: "key",
        namespace: "namespace",
        scope: "scope",
        value: "value",
        valueType: "valueType"
      }],
      minOrderQuantity: 0,
      optionTitle: "Awesome Soft Bike",
      originCountry: "US",
      price: 992,
      pricing: {
        USD: {
          compareAtPrice: null,
          displayPrice: "$992.00",
          maxPrice: 992,
          minPrice: 992,
          price: 992
        }
      },
      primaryImage: {
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      },
      shopId: "123",
      sku: "sku",
      taxCode: "0000",
      taxDescription: "taxDescription",
      title: "One pound bag",
      updatedAt,
      variantId: "874",
      weight: 2,
      width: 2
    }],
    originCountry: "US",
    price: 0,
    pricing: {
      USD: {
        compareAtPrice: 1100,
        displayPrice: "$992.00",
        maxPrice: 992,
        minPrice: 992,
        price: 0
      }
    },
    primaryImage: null,
    shopId: "123",
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: "875",
    weight: 0,
    width: 0
  }],
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const mockCatalogProductAfter = {
  _id: "999",
  barcode: "barcode",
  createdAt,
  description: "description",
  height: 11.23,
  isBackorder: false,
  isDeleted: false,
  isLowQuantity: false,
  isSoldOut: true,
  isTaxable: false,
  isVisible: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
  media: [{
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  }],
  metaDescription: "metaDescription",
  metafields: [{
    description: "description",
    key: "key",
    namespace: "namespace",
    scope: "scope",
    value: "value",
    valueType: "valueType"
  }],
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    height: 6.66,
    length: 4.44,
    weight: 7.77,
    width: 5.55
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  pricing: {
    USD: {
      compareAtPrice: null,
      displayPrice: "$992.00",
      maxPrice: 992,
      minPrice: 992,
      price: null
    }
  },
  primaryImage: {
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  },
  productId: "999",
  productType: "productType",
  shopId: "123",
  sku: "ABC123",
  slug: "fake-product",
  socialMetadata: [{
    message: "twitterMessage",
    service: "twitter"
  }, {
    message: "facebookMessage",
    service: "facebook"
  }, {
    message: "googlePlusMessage",
    service: "googleplus"
  }, {
    message: "pinterestMessage",
    service: "pinterest"
  }],
  supportedFulfillmentTypes: ["shipping"],
  tagIds: ["923", "924"],
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  title: "Fake Product Title",
  type: "product-simple",
  updatedAt,
  variants: [{
    _id: "875",
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    inventoryQuantity: 100,
    isLowQuantity: false,
    isSoldOut: true,
    isTaxable: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    media: [],
    metafields: [{
      description: "description",
      key: "key",
      namespace: "namespace",
      scope: "scope",
      value: "value",
      valueType: "valueType"
    }],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    options: [{
      _id: "874",
      barcode: "barcode",
      createdAt,
      height: 2,
      index: 0,
      inventoryManagement: true,
      inventoryPolicy: true,
      inventoryQuantity: 0,
      isLowQuantity: false,
      isSoldOut: true,
      isTaxable: true,
      length: 2,
      lowInventoryWarningThreshold: 0,
      media: [{
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      }],
      metafields: [{
        description: "description",
        key: "key",
        namespace: "namespace",
        scope: "scope",
        value: "value",
        valueType: "valueType"
      }],
      minOrderQuantity: 0,
      optionTitle: "Awesome Soft Bike",
      originCountry: "US",
      price: 992,
      pricing: {
        USD: {
          compareAtPrice: null,
          displayPrice: "$992.00",
          maxPrice: 992,
          minPrice: 992,
          price: 992
        }
      },
      primaryImage: {
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      },
      shopId: "123",
      sku: "sku",
      taxCode: "0000",
      taxDescription: "taxDescription",
      title: "One pound bag",
      updatedAt,
      variantId: "874",
      weight: 2,
      width: 2
    }],
    originCountry: "US",
    price: 0,
    pricing: {
      USD: {
        compareAtPrice: 1100,
        displayPrice: "$992.00",
        maxPrice: 992,
        minPrice: 992,
        price: 0
      }
    },
    primaryImage: null,
    shopId: "123",
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: "875",
    weight: 0,
    width: 0
  }],
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const mockCatalogItemBefore = {
  _id: internalCatalogItemId,
  createdAt,
  product: mockCatalogProductBefore,
  shopId: "123"
};

const mockCatalogItemAfter = {
  _id: internalCatalogItemId,
  createdAt,
  product: mockCatalogProductAfter,
  shopId: "123"
};

test("updates catalog item products' variants and options inventory with proper values", () => {
  mockCollections.Products.fetch.mockReturnValueOnce(mockVariants);
  const result = convertCatalogItemVariants(mockCatalogItemBefore, mockCollections);
  expect(mockCatalogItemAfter).toEqual(result);
});

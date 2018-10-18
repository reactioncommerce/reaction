import { cloneDeep } from "lodash";
import { internalShopId } from "./mockShop";
import {
  internalCatalogItemIds,
  mockExternalCatalogProducts,
  mockInternalCatalogProducts
} from "./mockCatalogProducts";

/**
 *
 * @todo TEMP mocks this will be removed in favor of a fixture/factory solution
 */

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

/**
 * mock internal catalog items
 */
export const mockCatalogItems = [
  {
    _id: internalCatalogItemIds[0],
    product: mockInternalCatalogProducts[0],
    shopId: internalShopId,
    createdAt,
    updatedAt
  },
  {
    _id: internalCatalogItemIds[1],
    product: mockInternalCatalogProducts[1],
    shopId: internalShopId,
    createdAt,
    updatedAt
  }
];

/**
 * Mock absolute URLs in catalog products when returned from GraphQL
 */
const mockExternalCatalogProductNodes = [];
const siteURL = "https://shop.fake.site";

function mockMediaURLsResponse(URLs) {
  const { large, medium, original, small, thumbnail } = URLs;
  return {
    thumbnail: `${siteURL}${thumbnail}`,
    small: `${siteURL}${small}`,
    medium: `${siteURL}${medium}`,
    large: `${siteURL}${large}`,
    original: `${siteURL}${original}`
  };
}

mockExternalCatalogProducts.forEach((mockExternalCatalogProduct) => {
  const cloned = cloneDeep(mockExternalCatalogProduct);
  cloned.product.primaryImage.URLs = mockMediaURLsResponse(cloned.product.primaryImage.URLs);
  cloned.product.media.forEach((media) => {
    media.URLs = mockMediaURLsResponse(media.URLs);
  });

  mockExternalCatalogProductNodes.push(cloned);
});

/**
 * mock unsorted catalogItems query response
 */
export const mockUnsortedCatalogItemsResponse = {
  catalogItems: {
    nodes: mockExternalCatalogProductNodes
  }
};


/**
 * mock sorted by minPrice high to low catalogItems query response
 */
export const mockSortedByPriceHigh2LowCatalogItemsResponse = {
  catalogItems: {
    nodes: [mockExternalCatalogProductNodes[1], mockExternalCatalogProductNodes[0]]
  }
};

/**
 * mock sorted by minPrice low to high catalogItems query response
 */
export const mockSortedByPriceLow2HighCatalogItemsResponse = {
  catalogItems: {
    nodes: [mockExternalCatalogProductNodes[0], mockExternalCatalogProductNodes[1]]
  }
};

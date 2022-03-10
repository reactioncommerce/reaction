import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyProductFilters from "./applyProductFilters";


describe("Test metafields search methods", () => {
  const mockProductFilters = {
    productIds: undefined,
    shopIds: ["mockShopId"],
    tagIds: undefined,
    query: undefined,
    isArchived: undefined,
    isVisible: undefined,
    isExactMatch: false, // selector user fuzzy search if false, exact match if true
    metafieldKey: "mockMetafieldKey",
    metafieldValue: "mockMetafieldValue",
    priceMin: undefined,
    priceMax: undefined
  };

  it("isExactMatch parameter is false", () => {
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: {
            $options: "i",
            $regex: "mockMetafieldKey"
          },
          value: {
            $options: "i",
            $regex: "mockMetafieldValue"
          }
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });

  it("isExactMatch parameter is true", () => {
    mockProductFilters.isExactMatch = true;
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: "mockMetafieldKey",
          value: "mockMetafieldValue"
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });

  it("Without isExactMatch parameter", () => {
    delete mockProductFilters.isExactMatch;
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: {
            $options: "i",
            $regex: "mockMetafieldKey"
          },
          value: {
            $options: "i",
            $regex: "mockMetafieldValue"
          }
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });
});

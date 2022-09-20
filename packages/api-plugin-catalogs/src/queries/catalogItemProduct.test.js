import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import catalogItemProduct from "./catalogItemProduct.js";

const productId = "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06MTIz"; // reaction/catalogItem:123
const productSlug = "PRODUCT_SLUG";
const mockQueryBase = {
  "product.isDeleted": { $ne: true },
  "product.isVisible": true
};

beforeEach(() => {
  jest.resetAllMocks();
});

// expect query by product slug
test("returns a product from the catalog collection by product slug", async () => {
  const query = {
    ...mockQueryBase,
    shopId: "123",
    $or: [
      { _id: productSlug },
      { "product.slug": productSlug }
    ]
  };
  mockContext.collections.Catalog.findOne.mockReturnValueOnce("CATALOGPRODUCT");
  const result = await catalogItemProduct(mockContext, { catalogIdOrProductSlug: productSlug, shopId: "123" });
  expect(mockContext.collections.Catalog.findOne).toHaveBeenCalledWith(query);
  expect(result).toBe("CATALOGPRODUCT");
});

// expect query by product _id
test("returns a product from the catalog collection by product ID", async () => {
  const query = {
    ...mockQueryBase,
    shopId: "123",
    $or: [
      { _id: productId },
      { "product.slug": productId }
    ]
  };
  mockContext.collections.Catalog.findOne.mockReturnValueOnce("CATALOGPRODUCT");
  const result = await catalogItemProduct(mockContext, { catalogIdOrProductSlug: productId, shopId: "123" });
  expect(mockContext.collections.Catalog.findOne).toHaveBeenCalledWith(query);
  expect(result).toBe("CATALOGPRODUCT");
});

// expect query by id if both slug and id are provided as params
test("returns a product from the catalog collection by product ID if both slug and ID are provided as params", async () => {
  const query = {
    ...mockQueryBase,
    $or: [
      { _id: productId },
      { "product.slug": productId }
    ]
  };
  mockContext.collections.Catalog.findOne.mockReturnValueOnce("CATALOGPRODUCT");
  const result = await catalogItemProduct(mockContext, { catalogIdOrProductSlug: productId });
  expect(mockContext.collections.Catalog.findOne).toHaveBeenCalledWith(query);
  expect(result).toBe("CATALOGPRODUCT");
});

// expect to throw Error if neither slug or id is provided
test("throws an error if neither product id or slug is provided", async () => {
  const results = catalogItemProduct(mockContext, {});
  return expect(results).rejects.toThrow();
});

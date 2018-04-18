import mockContext from "/imports/test-utils/helpers/mockContext";
import catalogItemProduct from "./catalogItemProduct";

const mockProductId = "PRODUCT_ID";
const mockProductSlug = "PRODUCT_SLUG";

const productId = mockProductId;
const productSlug = mockProductSlug;

beforeEach(() => {
  jest.resetAllMocks();
});

test("productId", async () => {
  mockContext.collections.Catalog.find.mockReturnValueOnce("CURSOR");
  const result = await catalogItemProduct(mockContext, { slugOrId: productId });
  expect(mockContext.collections.Catalog.findOne).toHaveBeenCalledWith({
    $or: [{ handle: productId }, { _id: productId }]
  });
  expect(result).toBe("CURSOR");
});

// test("shopIds and tagIds", async () => {
//   mockContext.collections.Catalog.find.mockReturnValueOnce("CURSOR");
//   const result = await catalogItemProduct(mockContext, { shopIds, tagIds });
//   expect(mockContext.collections.Catalog.find).toHaveBeenCalledWith({
//     hashtags: { $in: tagIds },
//     isDeleted: { $ne: true },
//     shopId: { $in: shopIds }
//   });
//   expect(result).toBe("CURSOR");
// });

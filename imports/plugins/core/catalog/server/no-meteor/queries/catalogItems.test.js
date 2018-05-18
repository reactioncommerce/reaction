import mockContext from "/imports/test-utils/helpers/mockContext";
import catalogItems from "./catalogItems";

const mockShopId = "SHOP_ID";
const mockTagId = "TAG_ID";

const shopIds = [mockShopId];
const tagIds = [mockTagId];

beforeEach(() => {
  jest.resetAllMocks();
});

test("shopIds", async () => {
  mockContext.collections.Catalog.find.mockReturnValueOnce("CURSOR");
  const result = await catalogItems(mockContext, { shopIds });
  expect(mockContext.collections.Catalog.find).toHaveBeenCalledWith({
    "product.isDeleted": { $ne: true },
    "product.isVisible": true,
    "shopId": { $in: shopIds }
  });
  expect(result).toBe("CURSOR");
});

test("shopIds and tagIds", async () => {
  mockContext.collections.Catalog.find.mockReturnValueOnce("CURSOR");
  const result = await catalogItems(mockContext, { shopIds, tagIds });
  expect(mockContext.collections.Catalog.find).toHaveBeenCalledWith({
    "product.tagIds": { $in: tagIds },
    "product.isDeleted": { $ne: true },
    "product.isVisible": true,
    "shopId": { $in: shopIds }
  });
  expect(result).toBe("CURSOR");
});

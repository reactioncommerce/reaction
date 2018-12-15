import mockContext from "/imports/test-utils/helpers/mockContext";
import tags from "./tags";

const mockShopId = "SHOP_ID";

beforeEach(() => {
  jest.resetAllMocks();
});

test("default - is visible only", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId);
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isDeleted: { $ne: true }, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("include deleted", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { shouldIncludeDeleted: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("top-level only", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { isTopLevel: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isDeleted: { $ne: true }, isTopLevel: true, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("non-top-level only", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { isTopLevel: false });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isDeleted: { $ne: true }, isTopLevel: false, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("top-level only, including deleted", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { isTopLevel: true, shouldIncludeDeleted: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isTopLevel: true, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("non-top-level only, including deleted", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { isTopLevel: false, shouldIncludeDeleted: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isTopLevel: false, isActive: { $ne: false } });
  expect(result).toBe("CURSOR");
});

test("include not visible - by an admin", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tags(mockContext, mockShopId, { shouldIncludeInvisible: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ shopId: mockShopId, isActive: { $or: [false, true] } });
  expect(result).toBe("CURSOR");
});
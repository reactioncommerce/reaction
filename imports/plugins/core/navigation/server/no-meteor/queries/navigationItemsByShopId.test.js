import mockContext from "/imports/test-utils/helpers/mockContext";
import navigationItemsByShopIdQuery from "./navigationItemsByShopId";

const query = { shopId: "123" };

test("calls NavigationItems.find and returns a navigation item", async () => {
  mockContext.collections.NavigationItems.find.mockReturnValueOnce("NAVIGATIONITEM");
  const result = await navigationItemsByShopIdQuery(mockContext, "123");
  expect(result).toBe("NAVIGATIONITEM");
  expect(mockContext.collections.NavigationItems.find).toHaveBeenCalledWith(query);
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  const result = navigationItemsByShopIdQuery(mockContext, "123");
  expect(result).rejects.toThrow();
});
